import HTTP from 'node:http';
import { getServerStatus } from './bot.ts';
import { ping } from 'bedrock-protocol';
import CONFIG from '../config.json' with { type: 'json' };
import { getUptime } from './index.ts';
import connectBot from './bot.ts';

const PORT = process.PORT || 5500;
const BEDROCK_VERSION = "1.21.5 to 1.21.81.2";

// In-memory log buffer
const LOG_BUFFER_SIZE = 100;
let logBuffer: string[] = [];

// Patch all console methods to capture logs
const origLog = console.log;
const origError = console.error;
const origWarn = console.warn;
function formatLogArg(arg: any): string {
  if (arg instanceof Error) {
    return arg.stack || arg.toString();
  }
  if (typeof arg === 'object' && arg !== null) {
    try {
      return JSON.stringify(arg, null, 2);
    } catch {
      return String(arg);
    }
  }
  return String(arg);
}
function logToBuffer(type: string, ...args: any[]) {
  const msg = args.map(formatLogArg).join(' ');
  logBuffer.push(`[${new Date().toLocaleTimeString()}] [${type}] ${msg}`);
  if (logBuffer.length > LOG_BUFFER_SIZE) logBuffer.shift();
}
console.log = function (...args) {
  logToBuffer('LOG', ...args);
  origLog.apply(console, args);
};
console.error = function (...args) {
  logToBuffer('ERROR', ...args);
  origError.apply(console, args);
};
console.warn = function (...args) {
  logToBuffer('WARN', ...args);
  origWarn.apply(console, args);
};
console.info = function (...args) {
  logToBuffer('INFO', ...args);
  origLog.apply(console, args);
};
console.debug = function (...args) {
  logToBuffer('DEBUG', ...args);
  origLog.apply(console, args);
};

// Fix pingServerStatus: remove invalid timeout property
async function pingServerStatus() {
  try {
    const res = await ping({
      host: CONFIG.client.host,
      port: +CONFIG.client.port
    });
    return res ? 'online' : 'offline';
  } catch (e) {
    return 'offline';
  }
}

const server = HTTP.createServer(async (request, response) => {
	if (request.url === '/status') {
    const status = await pingServerStatus();
    const uptime = getUptime();
    // Add host and port to status response
    const host = CONFIG.client.host;
    const port = CONFIG.client.port;
		response.writeHead(200, {
			"Access-Control-Allow-Origin": "*",
			"Content-Type": "application/json"
		});
		response.end(JSON.stringify({ status, uptime, version: BEDROCK_VERSION, host, port }));
		return;
	}

  if (request.url === '/start-bot' && request.method === 'POST') {
    response.writeHead(200, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify({ restarting: true }));
    setTimeout(() => process.exit(0), 500); // Give response time to send
    return;
  }

  if (request.url === '/connect-bot' && request.method === 'POST') {
    connectBot();
    response.writeHead(200, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify({ connected: true }));
    return;
  }

  if (request.url === '/logs') {
    response.writeHead(200, { 'Content-Type': 'application/json', 'Cache-Control': 'no-cache' });
    response.end(JSON.stringify({ logs: logBuffer }));
    return;
  }

  if (request.url === '/logs-stream') {
    response.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*'
    });
    response.write(`retry: 1000\n`);
    // Send current buffer
    response.write(`data: ${JSON.stringify(logBuffer)}\n\n`);
    // Push new logs as they come
    let lastLength = logBuffer.length;
    const interval = setInterval(() => {
      if (logBuffer.length > lastLength) {
        const newLogs = logBuffer.slice(lastLength);
        response.write(`data: ${JSON.stringify(newLogs)}\n\n`);
        lastLength = logBuffer.length;
      }
    }, 500);
    request.on('close', () => clearInterval(interval));
    return;
  }

  if (request.url === '/admin') {
    const html = `
      <html>
        <head>
          <title>Admin Dashboard - Aternos Minecraft Bot</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <link href="https://fonts.googleapis.com/css2?family=Fira+Mono:wght@400;700&family=Montserrat:wght@700&display=swap" rel="stylesheet">
          <style>
            body {
              background: linear-gradient(135deg, #232526 0%, #414345 100%);
              color: #f5f6fa;
              font-family: 'Montserrat', Arial, sans-serif;
              margin: 0;
              min-height: 100vh;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: flex-start;
            }
            .admin-header {
              margin-top: 40px;
              font-size: 2.3em;
              font-weight: 700;
              letter-spacing: 1px;
              color: #43b581;
              text-shadow: 0 2px 16px #000a;
              display: flex;
              align-items: center;
              gap: 0.5em;
            }
            .admin-header .icon {
              font-size: 1.2em;
              background: #23272a;
              border-radius: 50%;
              padding: 0.2em 0.4em;
              box-shadow: 0 2px 8px #0005;
            }
            .admin-container {
              background: #23272a;
              margin-top: 30px;
              padding: 2.5em 2em 2em 2em;
              border-radius: 18px;
              box-shadow: 0 8px 32px #000b;
              min-width: 380px;
              max-width: 800px;
              width: 90vw;
              display: flex;
              flex-direction: column;
              align-items: center;
            }
            .btn {
              background: linear-gradient(90deg, #43b581 60%, #357a4a 100%);
              color: #fff;
              border: none;
              padding: 0.9em 2.5em;
              border-radius: 8px;
              font-size: 1.15em;
              cursor: pointer;
              margin-top: 1.2em;
              font-weight: 700;
              letter-spacing: 0.5px;
              transition: background 0.2s, transform 0.1s;
              box-shadow: 0 2px 8px #0004;
            }
            .btn:active {
              background: #357a4a;
              transform: scale(0.98);
            }
            #connectMsg {
              color: #43b581;
              margin-top: 1em;
              font-weight: 600;
              font-size: 1.05em;
              min-height: 1.5em;
              transition: color 0.2s;
            }
            .console-title {
              font-family: 'Montserrat', Arial, sans-serif;
              font-size: 1.1em;
              color: #8be9fd;
              margin-bottom: 0.5em;
              margin-top: 2em;
              letter-spacing: 1px;
              text-align: left;
              width: 100%;
            }
            #console {
              background: #18191c;
              color: #f5f6fa;
              text-align: left;
              padding: 1.2em;
              border-radius: 12px;
              max-width: 100%;
              min-height: 220px;
              max-height: 350px;
              overflow-y: scroll;
              font-family: 'Fira Mono', 'Consolas', monospace;
              font-size: 1.02em;
              box-shadow: 0 2px 12px #0006;
              border: 1px solid #23272a;
              width: 100%;
              margin-bottom: 1em;
              transition: box-shadow 0.2s;
            }
            .log-line { white-space: pre-wrap; word-break: break-all; margin: 0; line-height: 1.5; }
            .log-error { color: #ff5555; font-weight: bold; }
            .log-warn { color: #ffb86c; }
            .log-info { color: #50fa7b; }
            .log-log { color: #8be9fd; }
            .log-time { color: #888; font-size: 0.95em; margin-right: 0.5em; }
            @media (max-width: 600px) {
              .admin-container { min-width: 0; padding: 1em 0.5em; }
              #console { font-size: 0.95em; }
            }
          </style>
        </head>
        <body>
          <div class="admin-header"><span class="icon">🛡️</span> Admin Dashboard</div>
          <div class="admin-container">
            <button class="btn" onclick="connectBotBtn()">Connect Bot to Aternos</button>
            <div id="connectMsg"></div>
            <div class="console-title">Live Server Console</div>
            <div id="console"></div>
          </div>
          <script>
            function connectBotBtn() {
              fetch('/connect-bot', { method: 'POST' })
                .then(r => r.json())
                .then(d => {
                  const msgDiv = document.getElementById('connectMsg');
                  if (msgDiv) {
                    msgDiv.innerText = d.connected ? 'Bot is connecting to Aternos server...' : 'Failed to connect.';
                    msgDiv.style.color = d.connected ? '#43b581' : '#ff5555';
                  }
                })
                .catch(() => {
                  const msgDiv = document.getElementById('connectMsg');
                  if (msgDiv) {
                    msgDiv.innerText = 'Failed to connect.';
                    msgDiv.style.color = '#ff5555';
                  }
                });
            }
            const logDiv = document.getElementById('console');
            const es = new EventSource('/logs-stream');
            function renderLogs(logs) {
              if (!logDiv) return;
              // Save scroll position and check if user is at bottom
              const wasAtBottom = Math.abs(logDiv.scrollTop + logDiv.clientHeight - logDiv.scrollHeight) < 2;
              const prevScrollTop = logDiv.scrollTop;
              const prevScrollHeight = logDiv.scrollHeight;
              // Use a DocumentFragment for better performance
              const frag = document.createDocumentFragment();
              logs.forEach(function(line) {
                var type = 'log-log';
                if (line.includes('[ERROR]')) type = 'log-error';
                else if (line.includes('[WARN]')) type = 'log-warn';
                else if (line.includes('[LOG]')) type = 'log-info';
                var timeMatch = line.match(/^[\[](.*?)[\]]/);
                var time = timeMatch ? "<span class='log-time'>" + timeMatch[0] + "</span>" : '';
                var msg = line.replace(/^[\[].*?[\]]\s*[\[].*?[\]]\s*/, '');
                var div = document.createElement('div');
                div.className = 'log-line ' + type;
                div.innerHTML = time + msg;
                frag.appendChild(div);
              });
              logDiv.innerHTML = '';
              logDiv.appendChild(frag);
              // Restore scroll position
              if (wasAtBottom) {
                logDiv.scrollTop = logDiv.scrollHeight;
              } else {
                logDiv.scrollTop = prevScrollTop + (logDiv.scrollHeight - prevScrollHeight);
              }
            }
            es.onmessage = function(event) {
              try {
                var logs = JSON.parse(event.data);
                if (Array.isArray(logs)) renderLogs(logs);
              } catch {}
            };
          </script>
        </body>
      </html>
    `;
    response.writeHead(200, {
      "Access-Control-Allow-Origin": "https://replit.com",
      "Access-Control-Allow-Methods": "GET, PING, OPTIONS, POST",
      "Content-Type": "text/html"
    } as const);
    response.end(html);
    return;
  }

  // Serve the logo image
  if (request.url === '/logo.png') {
    const fs = await import('node:fs/promises');
    try {
      const img = await fs.readFile('./Image/logo.png');
      response.writeHead(200, { 'Content-Type': 'image/png' });
      response.end(img);
    } catch (e) {
      response.writeHead(404);
      response.end('Not found');
    }
    return;
  }

  // Prepare server address for client-side use
  const serverAddress = `${CONFIG.client.host}:${CONFIG.client.port}`;

  // Main page HTML with server details and connect button
  const html = `
    <html>
      <head>
        <title>Aternos Minecraft Bot</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@700&display=swap" rel="stylesheet">
        <style>
          body {
            font-family: 'Montserrat', Arial, sans-serif;
            background: linear-gradient(135deg, #232526 0%, #414345 100%);
            color: #f5f6fa;
            margin: 0;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: flex-start;
          }
          .main-header {
            margin-top: 48px;
            font-size: 2.5em;
            font-weight: 700;
            letter-spacing: 1px;
            color: #43b581;
            text-shadow: 0 2px 16px #000a;
            display: flex;
            align-items: center;
            gap: 0.5em;
          }
          .main-header .icon {
            font-size: 1.3em;
            background: #23272a;
            border-radius: 50%;
            padding: 0.2em 0.4em;
            box-shadow: 0 2px 8px #0005;
          }
          .main-container {
            background: #23272a;
            margin-top: 32px;
            padding: 2.5em 2em 2em 2em;
            border-radius: 18px;
            box-shadow: 0 8px 32px #000b;
            min-width: 340px;
            max-width: 420px;
            width: 90vw;
            display: flex;
            flex-direction: column;
            align-items: center;
          }
          .minecraft-img {
            width: 120px;
            height: 120px;
            object-fit: contain;
            margin-bottom: 1.2em;
            border-radius: 16px;
            box-shadow: 0 4px 24px #0007;
            background: #18191c;
            border: 2px solid #43b581;
          }
          .info {
            margin: 0.7em 0;
            font-size: 1.13em;
            background: #18191c;
            padding: 0.7em 1.2em;
            border-radius: 8px;
            box-shadow: 0 2px 8px #0003;
            width: 100%;
            text-align: left;
          }
          .btn {
            background: linear-gradient(90deg, #43b581 60%, #357a4a 100%);
            color: #fff;
            border: none;
            padding: 0.9em 2.5em;
            border-radius: 8px;
            font-size: 1.15em;
            cursor: pointer;
            margin-top: 1.2em;
            font-weight: 700;
            letter-spacing: 0.5px;
            transition: background 0.2s, transform 0.1s;
            box-shadow: 0 2px 8px #0004;
          }
          .btn:active {
            background: #357a4a;
            transform: scale(0.98);
          }
          #copyMsg {
            color: #43b581;
            margin-top: 1em;
            font-weight: 600;
            font-size: 1.05em;
            min-height: 1.5em;
            transition: color 0.2s;
          }
          @media (max-width: 600px) {
            .main-container { min-width: 0; padding: 1em 0.5em; }
            .info { font-size: 1em; }
          }
        </style>
      </head>
      <body>
        <div class="main-header"><span class="icon">⛏️</span> Minecraft Server Info</div>
        <div class="main-container">
          <img class="minecraft-img" src="/logo.png" alt="Minecraft Logo" />
          <div class="info"><b>Host:</b> ${CONFIG.client.host}</div>
          <div class="info"><b>Port:</b> ${CONFIG.client.port}</div>
          <div class="info"><b>Bot Username:</b> ${CONFIG.client.username}</div>
          <div class="info"><b>Bedrock Version:</b> ${BEDROCK_VERSION}</div>
          <button class="btn" onclick="copyServer()">Copy Bedrock Server Address</button>
          <div id="copyMsg"></div>
        </div>
        <div style="margin-top:2.5em;opacity:0.7;font-size:1em;">Made with <span style="color:#43b581;">&#10084;</span> for Minecraft players</div>
        <script>
          function copyServer() {
            var text = "${serverAddress}";
            navigator.clipboard.writeText(text).then(function() {
              document.getElementById('copyMsg').innerText = 'Copied to clipboard!';
            }, function() {
              document.getElementById('copyMsg').innerText = 'Failed to copy.';
            });
          }
        </script>
      </body>
    </html>
  `;

	response.writeHead(200, {
		"Access-Control-Allow-Origin": "https://replit.com",
		"Access-Control-Allow-Methods": "GET, PING, OPTIONS",
		"Content-Type": "text/html"
	} as const);
	response.end(html);
  return;
});



export default (): void => {
	server.listen(PORT, () => {
		console.log("Server for UptimeRobot is ready!");
		console.log(`Web server running on port: ${PORT}`);
	});
};