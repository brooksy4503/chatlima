import { neonConfig } from '@neondatabase/serverless';
import WebSocket from 'ws';

// Configure WebSocket support for the NeonDB serverless driver.
// This MUST be done before any code that initializes a database connection is imported.
neonConfig.webSocketConstructor = WebSocket;
