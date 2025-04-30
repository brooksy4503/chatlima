import { model, type modelID } from "@/ai/providers";
import { streamText, type UIMessage } from "ai";
import { appendResponseMessages } from 'ai';
import { saveChat, saveMessages, convertToDBMessages } from '@/lib/chat-store';
import { nanoid } from 'nanoid';
import { db } from '@/lib/db';
import { chats } from '@/lib/db/schema';
import { eq, and } from 'drizzle-orm';

import { experimental_createMCPClient as createMCPClient, MCPTransport } from 'ai';
import { Experimental_StdioMCPTransport as StdioMCPTransport } from 'ai/mcp-stdio';
import { spawn } from "child_process";

// Allow streaming responses up to 60 seconds on Hobby plan
export const maxDuration = 60;

interface KeyValuePair {
  key: string;
  value: string;
}

interface MCPServerConfig {
  url: string;
  type: 'sse' | 'stdio';
  command?: string;
  args?: string[];
  env?: KeyValuePair[];
  headers?: KeyValuePair[];
}

export async function POST(req: Request) {
  const {
    messages,
    chatId,
    selectedModel,
    userId,
    mcpServers = [],
  }: {
    messages: UIMessage[];
    chatId?: string;
    selectedModel: modelID;
    userId: string;
    mcpServers?: MCPServerConfig[];
  } = await req.json();

  if (!userId) {
    return new Response(
      JSON.stringify({ error: "User ID is required" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  const id = chatId || nanoid();

  // Check if chat already exists for the given ID
  // If not, we'll create it in onFinish
  let isNewChat = false;
  if (chatId) {
    try {
      const existingChat = await db.query.chats.findFirst({
        where: and(
          eq(chats.id, chatId),
          eq(chats.userId, userId)
        )
      });
      isNewChat = !existingChat;
    } catch (error) {
      console.error("Error checking for existing chat:", error);
      // Continue anyway, we'll create the chat in onFinish
      isNewChat = true;
    }
  } else {
    // No ID provided, definitely new
    isNewChat = true;
  }

  // Initialize tools
  let tools = {};
  const mcpClients: any[] = [];

  // Process each MCP server configuration
  for (const mcpServer of mcpServers) {
    try {
      // Create appropriate transport based on type
      let transport: MCPTransport | { type: 'sse', url: string, headers?: Record<string, string> };

      if (mcpServer.type === 'sse') {
        // Convert headers array to object for SSE transport
        const headers: Record<string, string> = {};
        if (mcpServer.headers && mcpServer.headers.length > 0) {
          mcpServer.headers.forEach(header => {
            if (header.key) headers[header.key] = header.value || '';
          });
        }

        transport = {
          type: 'sse' as const,
          url: mcpServer.url,
          headers: Object.keys(headers).length > 0 ? headers : undefined
        };
      } else if (mcpServer.type === 'stdio') {
        // For stdio transport, we need command and args
        if (!mcpServer.command || !mcpServer.args || mcpServer.args.length === 0) {
          console.warn("Skipping stdio MCP server due to missing command or args");
          continue;
        }

        // Convert env array to object for stdio transport
        const env: Record<string, string> = {};
        if (mcpServer.env && mcpServer.env.length > 0) {
          mcpServer.env.forEach(envVar => {
            if (envVar.key) env[envVar.key] = envVar.value || '';
          });
        }

        // Check for uvx pattern
        if (mcpServer.command === 'uvx') {
          // Ensure uv is installed, which provides uvx
          console.log("Ensuring uv (for uvx) is installed...");
          let uvInstalled = false;
          const installUvSubprocess = spawn('pip3', ['install', 'uv']);
          // Capture output for debugging
          let uvInstallStdout = '';
          let uvInstallStderr = '';
          installUvSubprocess.stdout.on('data', (data) => { uvInstallStdout += data.toString(); });
          installUvSubprocess.stderr.on('data', (data) => { uvInstallStderr += data.toString(); });

          await new Promise<void>((resolve) => {
            installUvSubprocess.on('close', (code: number) => {
              if (code !== 0) {
                console.error(`Failed to install uv using pip3: exit code ${code}`);
                console.error('pip3 stdout:', uvInstallStdout);
                console.error('pip3 stderr:', uvInstallStderr);
              } else {
                console.log("uv installed or already present.");
                if (uvInstallStdout) console.log('pip3 stdout:', uvInstallStdout);
                if (uvInstallStderr) console.log('pip3 stderr:', uvInstallStderr);
                uvInstalled = true;
              }
              resolve();
            });
            installUvSubprocess.on('error', (err) => {
              console.error("Error spawning pip3 to install uv:", err);
              resolve(); // Resolve anyway
            });
          });

          if (!uvInstalled) {
            console.warn("Skipping uvx command: Failed to ensure uv installation.");
            continue;
          }

          // Do NOT modify the command or args. Let StdioMCPTransport run uvx directly.
          console.log(`Proceeding to spawn uvx command directly.`);
        }
        // If python is passed in the command, install the python package mentioned in args after -m
        else if (mcpServer.command.includes('python3')) {
          const packageName = mcpServer.args[mcpServer.args.indexOf('-m') + 1];
          console.log("Attempting to install python package using uv:", packageName);
          // Use uv to install the package
          const subprocess = spawn('uv', ['pip', 'install', packageName]);
          subprocess.on('close', (code: number) => {
            if (code !== 0) {
              console.error(`Failed to install python package ${packageName} using uv: ${code}`);
            } else {
              console.log(`Successfully installed python package ${packageName} using uv.`);
            }
          });
          // wait for the subprocess to finish
          await new Promise<void>((resolve) => {
            subprocess.on('close', () => resolve());
            subprocess.on('error', (err) => {
              console.error(`Error spawning uv command for package ${packageName}:`, err);
              resolve(); // Resolve anyway to avoid hanging
            });
          });
        }

        // Log the final command and args before spawning for stdio
        console.log(`Spawning StdioMCPTransport with command: '${mcpServer.command}' and args:`, mcpServer.args);

        transport = new StdioMCPTransport({
          command: mcpServer.command,
          args: mcpServer.args,
          env: Object.keys(env).length > 0 ? env : undefined
        });
      } else {
        console.warn(`Skipping MCP server with unsupported transport type: ${mcpServer.type}`);
        continue;
      }

      const mcpClient = await createMCPClient({ transport });
      mcpClients.push(mcpClient);

      const mcptools = await mcpClient.tools();

      console.log(`MCP tools from ${mcpServer.type} transport:`, Object.keys(mcptools));

      // Add MCP tools to tools object
      tools = { ...tools, ...mcptools };
    } catch (error) {
      console.error("Failed to initialize MCP client:", error);
      // Continue with other servers instead of failing the entire request
    }
  }

  // Register cleanup for all clients
  if (mcpClients.length > 0) {
    req.signal.addEventListener('abort', async () => {
      for (const client of mcpClients) {
        try {
          await client.close();
        } catch (error) {
          console.error("Error closing MCP client:", error);
        }
      }
    });
  }

  console.log("messages", messages);
  console.log("parts", messages.map(m => m.parts.map(p => p)));

  // If there was an error setting up MCP clients but we at least have composio tools, continue
  const result = streamText({
    model: model.languageModel(selectedModel),
    system: `You are a helpful AI assistant. Today's date is ${new Date().toISOString().split('T')[0]}.

    You have access to external tools provided by connected servers. These tools can perform specific actions like running code, searching databases, or accessing external services.

    ## How to Respond:
    1.  **Analyze the Request:** Understand what the user is asking.
    2.  **Use Tools When Necessary:** If an external tool provides the best way to answer (e.g., fetching specific data, performing calculations, interacting with services), select the most relevant tool(s) and use them. You can use multiple tools in sequence. Clearly indicate when you are using a tool and what it's doing.
    3.  **Use Your Own Abilities:** For requests involving brainstorming, explanation, writing, summarization, analysis, or general knowledge, rely on your own reasoning and knowledge base. You don't need to force the use of an external tool if it's not suitable or required for these tasks.
    4.  **Respond Clearly:** Provide your answer directly when using your own abilities. If using tools, explain the steps taken and present the results clearly.
    5.  **Handle Limitations:** If you cannot answer fully (due to lack of information, missing tools, or capability limits), explain the limitation clearly. Don't just say "I don't know" if you can provide partial information or explain *why* you can't answer. If relevant tools seem to be missing, you can mention that the user could potentially add them via the server configuration.

    ## Response Format:
    - Use Markdown for formatting.
    - Base your response on the results from any tools used, or on your own reasoning and knowledge.
    `,
    messages,
    tools,
    maxSteps: 20,
    providerOptions: {
      google: {
        thinkingConfig: {
          thinkingBudget: 2048,
        },
      },
      anthropic: {
        thinking: {
          type: 'enabled',
          budgetTokens: 12000
        },
      }
    },
    onError: (error) => {
      console.error(JSON.stringify(error, null, 2));
    },
    async onFinish({ response }) {
      const allMessages = appendResponseMessages({
        messages,
        responseMessages: response.messages,
      });

      await saveChat({
        id,
        userId,
        messages: allMessages,
      });

      const dbMessages = convertToDBMessages(allMessages, id);
      await saveMessages({ messages: dbMessages });
      // close all mcp clients
      // for (const client of mcpClients) {
      //   await client.close();
      // }
    }
  });

  result.consumeStream()
  return result.toDataStreamResponse({
    sendReasoning: true,
    getErrorMessage: (error) => {
      if (error instanceof Error) {
        if (error.message.includes("Rate limit")) {
          return "Rate limit exceeded. Please try again later.";
        }
      }
      console.error(error);
      return "An error occurred.";
    },
  });
}
