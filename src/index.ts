import connectBot from "./bot.ts";
import initWeb from "./web.ts";

connectBot();
initWeb();

// Restart every 1 hour
setInterval(() => {
  console.log('Restarting project (every 1 hour)...');
  process.exit(0);
}, 60 * 60 * 1000);

const startTime = Date.now();
export function getUptime() {
  const ms = Date.now() - startTime;
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${hours}h ${minutes}m ${seconds}s`;
}