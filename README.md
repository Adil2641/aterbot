# AterBot ✨  
[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](/LICENSE)  
### Keep your Aternos server alive 24/7.
Please star this project <3  
<br/>



# Important Notice 📢
### This project will be unmaintained until at least 2024.<br/>But you can use it as usual.



# Requirements 🎒
1. A Replit account.  
	Sign up at: https://replit.com/signup

2. An UptimeRobot account.  
	Sign up at: https://uptimerobot.com/signUp

3. A Minecraft server you owned.  
	Make sure your server settings ``online-mode`` set to ``false``!  
	And you should have an OP permission!



# Setup ⚙
1. Join your server.
2. Build a bedrock room somewhere, and stay in there.  
(Recommended room size: `X5 Y3 Z5`)
3. Go to [Replit](https://replit.com/).
4. Click `+` at the top right, click `Import from GitHub` at the close button.
5. Put `https://github.com/JadeMin/aterbot.git` into `GitHub URL`, click `Create Repl`.
6. Click `Run` at the top, your bot will join your server.  
7. **Teleport the bot into the bedrock room, change the bot's gamemode to `Creative` to not die!**
8. You'll see the `Webview` tab on Repl, copy the url.
10. Go to [UptimeRobot](https://uptimerobot.com/dashboard).
11. Click `Add New Monitor`, select `Monitor Type` to `HTTP(s)`.
12. Paste the url copied in `Step 8` into `URL (or IP)`.
13. Click `Create Monitor` 2 times.

Finally... DONE! Enjoy your free 24/7 Aternos server.



# FAQ ❓
> #### Q1: My bot leaves immediately when I close the Repl page.
<details><summary>A1:</summary>

Repl projects are automatically turned off when close the window, or after 5 minutes of inactivity.  
And UptimeRobot trying to wake it up in every 5 minutes.  
So you can just leave it even if it's not working for a while.  
</details>

<hr/>

> #### Q2: How to fix `unsupported/unknown protocol version: ###, update minecraft-data`?
<details><summary>A2:</summary>

This project is using the `mineflayer` module.  
**It may not supported on your server version yet.**  
I'm trying to periodically check for updates, so please be patient.
</details>

<hr/>

> #### Q3: How to fix `Invalid move player packet received`?
<details><summary>A3:</summary>

It seems your bot escaped from the bedrock room.    
So you have to wipe the playerdata in your server.  
1. Go to the management page of your Aternos server.
2. Click `Files` in the left section.
3. Delete the `world/playerdata/<UUID>.dat`, `<UUID>.dat_old` file. (the UUID is your bot's UUID)
4. Restart the bot.

**Lock the bot somewhere as soon as possible!**  
**And change the bot's gamemode to `Creative` to not die.**
</details>

<hr/>

> #### Q4: My bot leaves permanently after n hours.
<details><summary>A4:</summary>

Aternos automatically bans AFK players from your server.  
So just unban your bot, if it's banned.
</details>



# Features 🚀
- **Bedrock Bot Connection:** Automatically connects a bot to your Minecraft Bedrock server using configurable credentials.
- **Auto-Reconnect:** The bot will auto-reconnect if disconnected and restarts every hour for reliability.
- **Web Dashboard:** Built-in web server provides a status API, logs, and an admin dashboard for bot control and monitoring.
- **Live Logs:** View real-time logs and server status from the web dashboard.
- **Configurable:** All connection details are managed via `config.json`.
- **Utility Functions:** Includes helpers for sleep and random selection.

# Project Structure 🗂
```
Aternos-Bot/
├── config.json         # Configuration for bot connection (host, port, username, etc.)
├── package.json        # Project metadata and dependencies
├── tsconfig.json       # TypeScript configuration
├── src/
│   ├── bot.ts          # Main bot logic: connects to server, handles events, status
│   ├── index.ts        # Entry point: starts bot and web server, handles uptime/restart
│   ├── utils.ts        # Utility functions (sleep, getRandom)
│   ├── web.ts          # Web server: status API, admin dashboard, logs
│   └── @types/         # TypeScript type definitions
├── README.md           # Project documentation
├── LICENSE             # License file
└── ...                 # Other supporting files
```



# CAUTION ⚠
### Aternos might detect your suspicious actions and delete your account!  
**By using this, you acknowledge that you're responsible for any problems arise.**