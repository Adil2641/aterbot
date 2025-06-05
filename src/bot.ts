import { createClient } from 'bedrock-protocol';
import CONFIG from '../config.json' with { type: 'json' };

let client;
let serverStatus = 'offline'; // Track server status

function connectBot() {
  client = createClient({
    host: CONFIG.client.host,
    port: +CONFIG.client.port,
    username: CONFIG.client.username,
    offline: true // Bedrock servers often use offline mode
  });

  client.on('login', () => {
    serverStatus = 'online';
    console.log(`BedrockBot logged in as ${CONFIG.client.username}`);
  });

  client.on('disconnect', (reason) => {
    serverStatus = 'offline';
    console.log('Disconnected:', reason);
    setTimeout(connectBot, CONFIG.action.retryDelay || 15000);
  });

  client.on('end', () => {
    serverStatus = 'offline';
    console.log('Connection ended');
  });

  client.on('error', (err) => {
    serverStatus = 'offline';
    console.error('Error:', err);
  });
}

export function getServerStatus() {
  return serverStatus;
}

export default connectBot;