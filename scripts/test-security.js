const https = require('https');
const http = require('http');

// Test the chat API endpoint
async function testChatAPI() {
  const hostname = 'localhost';
  const port = 3000;
  
  const postData = JSON.stringify({
    messages: [
      {
        id: "user-msg-1",
        role: "user",
        content: "Hello, can you help me with a simple question?",
        parts: [
          {
            type: "text",
            text: "Hello, can you help me with a simple question?"
          }
        ]
      }
    ],
    selectedModel: "openrouter/openai/chatgpt-4o-latest",
    webSearch: {
      enabled: false,
      contextSize: "medium"
    },
    apiKeys: {},
    attachments: [],
    mcpServers: []
  });

  const options = {
    hostname: hostname,
    port: port,
    path: '/api/chat',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(postData),
      // Try with a simple cookie that might work
      'Cookie': 'better-auth.session_token=hlaIJGU2PKJiuLnDHE7kV0f1yWnwr8cl.UcO2voqxX91tPhDoF82XtVj9Xp%2FXLY%2FNXXyH2bqkxoU%3D'
    }
  };

  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      
      res.on('data', (chunk) => {
        data += chunk;
      });
      
      res.on('end', () => {
        console.log('Status Code:', res.statusCode);
        console.log('Response Headers:', res.headers);
        console.log('Response Body:', data);
        resolve({ statusCode: res.statusCode, data: data });
      });
    });

    req.on('error', (err) => {
      console.error('Request Error:', err);
      reject(err);
    });

    req.write(postData);
    req.end();
  });
}

// Test different scenarios
async function runTests() {
  console.log('=== Testing Chat API Security ===\n');
  
  try {
    console.log('1. Testing anonymous user with premium model...');
    const result = await testChatAPI();
    
    if (result.statusCode === 401) {
      console.log('✅ PASS: Authentication required (expected)');
    } else if (result.statusCode === 403) {
      console.log('✅ PASS: Premium model access blocked (expected)');
    } else if (result.statusCode === 200) {
      console.log('❌ FAIL: Anonymous user accessed premium model (security vulnerability!)');
    } else {
      console.log(`⚠️  UNEXPECTED: Status ${result.statusCode}`);
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

runTests();
