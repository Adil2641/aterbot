import connectBot from "./bot.ts";
import initWeb from "./web.ts";

connectBot();
initWeb();

const startTime = Date.now();
export function getUptime() {
  const ms = Date.now() - startTime;
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${hours}h ${minutes}m ${seconds}s`;
}