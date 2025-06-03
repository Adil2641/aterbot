import HTTP from 'node:http';
import { getServerStatus } from './bot.ts';
import { ping } from 'bedrock-protocol';
import CONFIG from '../config.json' assert { type: 'json' };
import { getUptime } from './index.ts';

const PORT = process.PORT || 5500;

async function pingServerStatus() {
  try {
    const res = await ping({
      host: CONFIG.client.host,
      port: +CONFIG.client.port,
      timeout: 3000
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
		response.writeHead(200, {
			"Access-Control-Allow-Origin": "*",
			"Content-Type": "application/json"
		});
		response.end(JSON.stringify({ status, uptime }));
		return;
	}

	response.writeHead(200, {
		"Access-Control-Allow-Origin": "https://replit.com",
		"Access-Control-Allow-Methods": "GET, PING, OPTIONS",
		"Content-Type": "text/html"
	} as const);
	response.end("<h3>Copy me, the url above!</h3>");
});



export default (): void => {
	server.listen(PORT, () => {
		console.log("Server for UptimeRobot is ready!");
		console.log(`Web server running on port: ${PORT}`);
	});
};