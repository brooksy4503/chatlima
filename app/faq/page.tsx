export const metadata = {
  title: 'Frequently Asked Questions - ChatLima',
  description: 'Frequently asked questions about ChatLima subscriptions, models, and features',
};

export default function FAQPage() {
  return (
    <div className="h-full overflow-y-auto">
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-12 max-w-4xl">
          <div className="bg-card border border-border rounded-lg shadow-sm p-8 md:p-12">
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Frequently Asked Questions
            </h1>
            
            <p className="text-muted-foreground mb-8 italic">
              Last updated: {new Date().toLocaleDateString('en-AU', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>

            <div className="space-y-8">
              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">
                  What are free models?
                </h2>
                <p className="text-card-foreground leading-relaxed mb-4">
                  Free models are powerful AI models that don&apos;t require additional credits or fees to use. 
                  These models are provided through OpenRouter and are perfect for most everyday tasks like 
                  writing emails, brainstorming ideas, answering questions, and general conversation.
                </p>
                <p className="text-card-foreground leading-relaxed mb-4">
                  Current top free models include:
                </p>
                <div className="bg-muted p-4 rounded-lg">
                  <ul className="space-y-2 text-card-foreground">
                    <li>• Grok 4.1 Fast - Fast and capable for general tasks</li>
                    <li>• GPT-OSS-20B - OpenAI&apos;s open-source model</li>
                    <li>• Kimi K2 - Great for reasoning and analysis</li>
                    <li>• DeepSeek R1 - Advanced reasoning capabilities</li>
                    <li>• GLM-4.5 Air - Efficient and versatile</li>
                    <li>• Dolphin Mistral 24B - Strong performance for various tasks</li>
                    <li>• Qwen3-235B - Large-scale model for complex queries</li>
                    <li>• DeepSeek Chat V3 - Conversational AI specialist</li>
                    <li>• Gemma 3-27B - Google&apos;s efficient model</li>
                  </ul>
                </div>
                <p className="text-card-foreground leading-relaxed mt-4">
                  These models handle about 80% of typical chat needs and are included with your yearly subscription 
                  at no extra cost. No setup required—just start chatting!
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">
                  What are premium models?
                </h2>
                <p className="text-card-foreground leading-relaxed mb-4">
                  Premium models are advanced AI models that offer enhanced capabilities for complex tasks, 
                  advanced reasoning, and specialized use cases. These models typically provide better accuracy, 
                  deeper understanding, and more sophisticated responses for challenging questions.
                </p>
                <p className="text-card-foreground leading-relaxed mb-4">
                  Current premium models include:
                </p>
                <div className="bg-muted p-4 rounded-lg">
                  <ul className="space-y-2 text-card-foreground">
                    <li>• GPT-5.1 Chat - OpenAI&apos;s latest flagship model</li>
                    <li>• Claude Sonnet 4.5 - Anthropic&apos;s advanced reasoning model</li>
                    <li>• Grok 4.1 Fast - X.AI&apos;s premium offering</li>
                    <li>• Gemini 3 Pro Preview - Google&apos;s most capable model</li>
                    <li>• Kimi K2 Thinking - Advanced reasoning capabilities</li>
                    <li>• MiniMax M2 - High-performance model</li>
                    <li>• GLM-4.6 - Latest from Z-AI</li>
                  </ul>
                </div>
                <p className="text-card-foreground leading-relaxed mt-4">
                  Premium models are ideal for complex analysis, advanced problem-solving, creative writing, 
                  and tasks that require deep reasoning. They&apos;re available with the monthly subscription plan.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">
                  What&apos;s the difference between yearly and monthly plans?
                </h2>
                <div className="space-y-4">
                  <div className="bg-muted p-4 rounded-lg">
                    <h3 className="text-xl font-medium text-foreground mb-3">
                      Yearly Plan ($10/year)
                    </h3>
                    <ul className="space-y-2 text-card-foreground">
                      <li>✓ Unlimited messages</li>
                      <li>✓ Unlimited access to all free models</li>
                      <li>✓ Perfect for everyday use</li>
                      <li>✓ Save 92% compared to monthly</li>
                      <li>✓ Access to MCP tools (maps, search, etc.)</li>
                    </ul>
                    <p className="text-card-foreground mt-3 italic">
                      Best for: Casual users, students, and anyone who primarily uses free models for 
                      writing, brainstorming, and general AI assistance.
                    </p>
                  </div>
                  <div className="bg-muted p-4 rounded-lg">
                    <h3 className="text-xl font-medium text-foreground mb-3">
                      Monthly Plan ($10/month)
                    </h3>
                    <ul className="space-y-2 text-card-foreground">
                      <li>✓ 1,000 messages per month</li>
                      <li>✓ Access to all models (premium + free)</li>
                      <li>✓ Premium model access (GPT-5.1, Claude, etc.)</li>
                      <li>✓ Web search capabilities</li>
                      <li>✓ Access to MCP tools</li>
                    </ul>
                    <p className="text-card-foreground mt-3 italic">
                      Best for: Power users, professionals, and anyone who needs premium models for 
                      advanced tasks, complex analysis, or heavy usage.
                    </p>
                  </div>
                </div>
                <p className="text-card-foreground leading-relaxed mt-4">
                  <strong>Key insight:</strong> Free models power about 80% of typical chats and are 
                  excellent for most tasks. The monthly plan is your &quot;flex pass&quot; if you need heavy premium 
                  model usage or advanced capabilities.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">
                  What are MCP tools?
                </h2>
                <p className="text-card-foreground leading-relaxed mb-4">
                  MCP (Model Context Protocol) tools extend ChatLima&apos;s capabilities beyond basic chat. 
                  These integrations allow the AI to interact with external services and perform real-world actions.
                </p>
                <p className="text-card-foreground leading-relaxed mb-4">
                  Examples of MCP tools include:
                </p>
                <div className="bg-muted p-4 rounded-lg">
                  <ul className="space-y-2 text-card-foreground">
                    <li>• <strong>Google Maps</strong> - Get directions, find places, check locations</li>
                    <li>• <strong>Web Search</strong> - Search the internet for current information</li>
                    <li>• <strong>File Operations</strong> - Read and write files on your system</li>
                    <li>• <strong>Code Execution</strong> - Run code snippets and see results</li>
                    <li>• <strong>Database Access</strong> - Query databases and retrieve data</li>
                    <li>• <strong>API Integrations</strong> - Connect to various third-party services</li>
                  </ul>
                </div>
                <p className="text-card-foreground leading-relaxed mt-4">
                  MCP tools make ChatLima more powerful by allowing the AI to take actions, not just answer 
                  questions. For example, you can ask &quot;Show me directions to the nearest coffee shop&quot; and the 
                  AI can use Google Maps to provide real directions.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">
                  Do I need an OpenRouter account?
                </h2>
                <p className="text-card-foreground leading-relaxed">
                  No! ChatLima handles everything for you. You don&apos;t need to sign up for OpenRouter, manage 
                  API keys, or purchase credits separately. When you subscribe to ChatLima, we handle all the 
                  technical setup and provide you with a seamless experience. Just sign in and start chatting—we 
                  take care of rest.
                </p>
                <p className="text-card-foreground leading-relaxed mt-4">
                  ChatLima provides additional features and a polished interface that you won&apos;t find on OpenRouter 
                  directly, including MCP tool integrations, preset management, and a user-friendly chat interface.
                </p>
              </section>

              <section id="openrouter-api-keys">
                <h2 className="text-2xl font-semibold text-foreground mb-4">
                  How do I use my own OpenRouter API key?
                </h2>
                <p className="text-card-foreground leading-relaxed mb-4">
                  ChatLima supports Bring Your Own Key (BYOK) functionality, allowing you to use your own OpenRouter 
                  API key if you prefer. This gives you full control over your AI usage and billing through OpenRouter directly.
                </p>
                <div className="bg-muted p-4 rounded-lg mb-4">
                  <h3 className="text-xl font-medium text-foreground mb-3">
                    Benefits of using your own API key:
                  </h3>
                  <ul className="space-y-2 text-card-foreground">
                    <li>• Direct billing through your OpenRouter account</li>
                    <li>• Access to all models you&apos;ve purchased or have access to</li>
                    <li>• Bypasses ChatLima credit system and message limits</li>
                    <li>• Full control over your API usage and spending</li>
                    <li>• Real-time model availability based on your OpenRouter account</li>
                  </ul>
                </div>
                <p className="text-card-foreground leading-relaxed mb-4">
                  <strong>How to configure your OpenRouter API key in ChatLima:</strong>
                </p>
                <ol className="list-decimal list-inside space-y-3 text-card-foreground ml-4">
                  <li>
                    <strong>Get your OpenRouter API key:</strong>
                    <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                      <li>Sign up or log in to <a href="https://openrouter.ai/keys" target="_blank" rel="noopener noreferrer" className="text-primary hover:text-primary/80 underline">OpenRouter</a></li>
                      <li>Navigate to the &quot;Keys&quot; section in your dashboard</li>
                      <li>Click &quot;Create Key&quot; and give it a name like &quot;ChatLima&quot;</li>
                      <li>Copy the API key (starts with <code className="bg-muted px-2 py-1 rounded text-sm">sk-or-v1-</code>)</li>
                    </ul>
                  </li>
                  <li>
                    <strong>Add the key to ChatLima:</strong>
                    <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                      <li>Open ChatLima and click the settings icon (⚙️) near the model selector</li>
                      <li>Find the &quot;OpenRouter API Key&quot; field</li>
                      <li>Paste your API key</li>
                      <li>Click &quot;Save&quot;</li>
                    </ul>
                  </li>
                  <li>
                    <strong>Start using your models:</strong>
                    <ul className="list-disc list-inside space-y-1 ml-4 mt-2">
                      <li>The model list will automatically refresh to show all available models</li>
                      <li>Models you have access to will be marked as available</li>
                      <li>Your usage will be billed directly to your OpenRouter account</li>
                    </ul>
                  </li>
                </ol>
                <div className="bg-muted p-4 rounded-lg mt-4">
                  <h3 className="text-xl font-medium text-foreground mb-3">
                    Notes and Tips:
                  </h3>
                  <ul className="space-y-2 text-card-foreground">
                    <li>• Your API key is stored locally in your browser and is never sent to ChatLima servers</li>
                    <li>• You can remove or replace your API key at any time from the settings</li>
                    <li>• The key is only used to make requests directly to OpenRouter</li>
                    <li>• If you remove the key, you&apos;ll revert to ChatLima&apos;s subscription-based access</li>
                    <li>• Model availability updates instantly when you add or remove your API key</li>
                  </ul>
                </div>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">
                  Can I switch plans?
                </h2>
                <p className="text-card-foreground leading-relaxed mb-4">
                  Yes! You can switch between plans at any time. Here&apos;s how it works:
                </p>
                <ul className="list-disc list-inside space-y-2 text-card-foreground ml-4">
                  <li>If you have a yearly plan and want premium models, you can upgrade to monthly</li>
                  <li>If you have a monthly plan and want to save money, you can switch to yearly</li>
                  <li>One subscription replaces the other—you can only have one active subscription at a time</li>
                  <li>Changes take effect immediately</li>
                </ul>
                <p className="text-card-foreground leading-relaxed mt-4">
                  To switch plans, visit the <a href="/upgrade" className="text-primary hover:text-primary/80 underline">upgrade page</a> and select your preferred plan. 
                  You&apos;ll be guided through the checkout process.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">
                  What happens if I cancel?
                </h2>
                <p className="text-card-foreground leading-relaxed">
                  You can cancel your subscription at any time with no penalties or fees. Your subscription will 
                  remain active until the end of your current billing period. After cancellation:
                </p>
                  <ul className="list-disc list-inside space-y-2 text-card-foreground ml-4 mt-4">
                  <li>You&apos;ll continue to have access to all features until your current period ends</li>
                  <li>You won&apos;t be charged for the next billing cycle</li>
                  <li>Your account and chat history will be preserved</li>
                  <li>You can resubscribe anytime</li>
                </ul>
                <p className="text-card-foreground leading-relaxed mt-4">
                  To cancel, visit your subscription management portal from the upgrade page or contact support.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">
                  How do I manage my subscription?
                </h2>
                <p className="text-card-foreground leading-relaxed mb-4">
                  Managing your subscription is easy:
                </p>
                <ul className="list-disc list-inside space-y-2 text-card-foreground ml-4">
                  <li>Visit the <a href="/upgrade" className="text-primary hover:text-primary/80 underline">upgrade page</a> and click &quot;Manage your subscription&quot;</li>
                  <li>You&apos;ll be taken to your subscription portal where you can:</li>
                  <ul className="list-disc list-inside space-y-1 ml-6 mt-2">
                    <li>View your current plan and billing details</li>
                    <li>Update payment methods</li>
                    <li>Cancel or modify your subscription</li>
                    <li>View billing history</li>
                  </ul>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-foreground mb-4">
                  Still have questions?
                </h2>
                <div className="bg-muted p-6 rounded-lg">
                  <p className="text-card-foreground mb-4">
                    We&apos;re here to help! If you have any other questions, please contact us:
                  </p>
                  <ul className="space-y-2">
                    <li className="flex items-center space-x-2">
                      <span className="text-muted-foreground">Email:</span>
                      <a href="mailto:getchatlima@gmail.com" className="text-primary hover:text-primary/80">
                        getchatlima@gmail.com
                      </a>
                    </li>
                    <li className="flex items-center space-x-2">
                      <span className="text-muted-foreground">Website:</span>
                      <a href="https://chatlima.com" className="text-primary hover:text-primary/80">
                        https://chatlima.com
                      </a>
                    </li>
                  </ul>
                </div>
              </section>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
