# How to Add Exa.ai MCP Server to Chatlima

This guide will walk you through adding the Exa.ai MCP server to Chatlima. Exa provides powerful web search and code search capabilities that AI assistants can use to find up-to-date information from the internet and code repositories.

## What You'll Need

- A web browser
- A Chatlima account
- About 5-10 minutes

---

## Step 1: Create an Exa Account and Get Your API Key

### 1.1 Go to the Exa Dashboard
Visit https://dashboard.exa.ai in your web browser.

### 1.2 Sign Up or Sign In
- If you don't have an account yet, click **"Continue with Google"** or **"Continue with email"** to create a new account
- If you already have an account, sign in with your existing credentials

### 1.3 Create an API Key
1. In the left sidebar, click on **"API Keys"**
2. Click the **"+ CREATE NEW KEY"** button
3. Give your key a name (e.g., "Chatlima" or "My Personal Key")
4. Click **"Create"**
5. **Important:** Copy your API key immediately - you won't be able to see it again!

### 1.4 Create Your MCP URL with API Key
Now you need to create the special URL that includes your API key. This is the URL you'll paste into Chatlima.

Your Exa MCP server URL with your API key will look like this:

```
https://mcp.exa.ai/mcp?exaApiKey=YOUR_API_KEY_HERE
```

Replace `YOUR_API_KEY_HERE` with the API key you just copied.

For example, if your API key is `abc123xyz`, your URL would be:

```
https://mcp.exa.ai/mcp?exaApiKey=abc123xyz
```

**Tip:** Copy this full URL (including the API key) - you'll need it in the next step.

---

## Step 2: Add the Exa MCP Server to Chatlima

### 2.1 Open the MCP Server Manager
1. In the Chatlima sidebar, click on **"Settings"**
2. In the settings menu, click on **"MCP Servers"**
3. This will open the MCP Server Manager dialog

### 2.2 Add a New Server
1. Click the **"Add Server"** button
2. Fill in the following information:

   **Server Name:**
   - Enter: `Exa`
   
   **Display Title (Optional):**
   - Enter: `Exa AI Search`
   
   **Transport Type:**
   - Select: **SSE** (Server-Sent Events)
   
   **Server URL:**
   - Paste the URL you created in Step 1.4 (the one with your API key)
   - It should look like: `https://mcp.exa.ai/mcp?exaApiKey=YOUR_API_KEY_HERE`

### 2.3 Save the Server
1. Click the **"Save"** or **"Add"** button to save your configuration
2. You should see a success message confirming the server was added

### 2.4 Enable the Server
1. Find the "Exa" server in your server list
2. Click the **"Enable Server"** button to activate it
3. You should see the server change to "Active" status

---

## Step 3: Test Your Exa MCP Server

### 3.1 Verify Connection
1. In the MCP Server Manager, click the **"Test Connection"** button (usually a Wi-Fi or checkmark icon) next to your Exa server
2. Wait a few seconds for the connection test to complete
3. You should see a green checkmark and a "Configuration valid" message

### 3.3 Try It Out
Now you're ready to use Exa with Chatlima! Try asking Chatlima to:

- "Search the web for recent news about artificial intelligence"
- "Find examples of how to use React hooks with TypeScript"
- "What are the latest developments in quantum computing?"

The Exa MCP server will automatically be used to search the web and find relevant, up-to-date information.

---

## What Can Exa Do?

Once connected, Exa provides Chatlima with several powerful tools:

### Web Search
Search the internet in real-time to find current information, news, and resources.

### Code Search
Search billions of GitHub repositories, documentation pages, and StackOverflow posts to find code examples, implementation patterns, and best practices.

### Company Research
Comprehensive research on companies by crawling their websites.

### Deep Research
An AI researcher that searches the web, reads many sources, and creates detailed research reports on complex topics.

### Content Crawling
Extract content from specific URLs, useful for reading articles, PDFs, or any web page when you know the exact URL.

---

## Troubleshooting

### Problem: "Connection test failed"
- Make sure you copied the complete URL with your API key
- Verify your API key is valid (you may need to generate a new one)
- Check that you don't have any extra spaces in the URL

### Problem: "Server won't activate"
- Make sure you selected "SSE" as the transport type
- Verify the URL starts with `https://mcp.exa.ai/mcp`
- Try refreshing the page and enabling the server again

### Problem: "Can't create API key"
- Make sure you're signed into your Exa account
- Check your email for verification if it's a new account
- Try using a different browser if the page doesn't load

### Problem: "Exa isn't finding results"
- Make sure you're asking clear, specific questions
- Try different search terms or rephrase your question
- Remember that some very recent information might not be indexed yet

---

## Need Help?

If you run into any issues:

- **Exa Documentation:** Visit https://docs.exa.ai/reference/exa-mcp for more details
- **Chatlima Support:** Check the Chatlima help documentation or contact support
- **Exa Support:** Visit https://exa.ai/ and look for their support options

---

## Tips for Best Results

1. **Ask specific questions:** Instead of "tell me about AI", try "what are the latest breakthroughs in AI for healthcare in 2025?"

2. **Combine with code requests:** Ask "show me examples of how to implement authentication in Next.js with TypeScript" to get code examples from Exa's code search

3. **Use for research:** Complex topics work great with Exa's deep research capabilities - just say "do a deep research on [topic]"

4. **Check your API usage:** Exa offers free tiers, but heavy usage may require a paid plan. Check your Exa dashboard for usage stats

---

Congratulations! You've successfully added the Exa.ai MCP server to Chatlima. You can now access powerful web search and code search capabilities to get more accurate and up-to-date information from your AI assistant.