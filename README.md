# 🧈 Mentega Text-to-Speech 🧈
## THIS PROJECT HAS BEEN DISCONTINUED IN FAVOR OF [MENTEGA STREAMKIT](https://github.com/mentegago/streamkit) ##
### [Klik di sini untuk instruksi dalam Bahasa Indonesia](README_ID.md)
A simple Twitch Text-to-Speech with (very unreliable) multi language (🇮🇩 Indonesian, 🇺🇸 English, and 🇯🇵 Japanese) support! Please follow my Twitch at [https://www.twitch.tv/mentegagoreng](https://www.twitch.tv/mentegagoreng) if you want to see the TTS on action. _Or just follow me anyway. Seriously tho._

## Installation
This software runs on the browser, so you can either open the URL or add it to your OBS browser source. I personally prefer using OBS browser source since I can have more freedom to adjust the audio, such as setting the volume or the audio track.

1. Download the files from [here](https://github.com/mentegago/mentega-tts/releases/latest).
2. Unzip and open `index.html`.
3. Add this to **the end** of the URL:

````
#channel={target channel}
````

4. Fill in the parameters with these values:

Parameters:
- `channel`: Channel to which the TTS will run on.
- (_Optional, required to use !join and !leave command_) `username`: Your username.
- (_Optional, currently unused_) `token`: Your oauth token. Get your token here: [https://twitchapps.com/tmi/](https://twitchapps.com/tmi/).
- (_Optional_) `hideNotifications`: set to `true` to hide notification message that shows up on top left corner of the screen.

The parameters are put in hash (`#`) instead of query (`?`) so you that your OAuth token never leaves the client (except to Twitch). That way, there's no worry of your OAuth token being logged by any server.

If you open the URL in your browser, do note that:
1. **You'll need to refresh the page** everytime you change any of the parameters as the software doesn't listen to window hash changes.
2. **You'll need to click on the page first** on most browsers, or else the audio will be blocked. You can mitigate this by allowing audio autoplay for the page.

## Commands
You can use these commands in chat to perform actions. **You need to provide your username in the URL parameter (See [Installation](#installation))!**
- `!join <channel>`: Enable TTS on the specified channel.
- `!leave <channel>`: Disable TTS on the specified channel. `<channel>` cannot be the main channel set in the URL parameter.

## Not yet implemented
- TTS will always ignore chat that starts with exclamation mark (`!`). No option to disable this filtering yet.
- TTS limits to only 200 characters per message.
- TTS chat queue limits to only 5 chats. If there are more chat entering the queue, it will remove the oldest one. No option to override yet.
- Indonesian, English, and Japanese only. Cannot add or remove any of them. Theoretically it's possible to add other languages, but I haven't implemented it yet. I don't think I'll be implementing it anytime soon.

## Contributing
If you have any suggestions or bug, do submit an Issue. If you want to contribute a code, please do submit a Pull Request. I'll appreciate it a lot!

## Building
It's written in the best, most beautiful JavaScript framework: [VanillaJS](http://vanilla-js.com/). So, no building required. Do note that the code uses modern JavaScript without polyfill, so make sure your browser is up-to-date!

## License
[MIT License](LICENSE)
