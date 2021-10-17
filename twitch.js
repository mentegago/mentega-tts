function Twitch(username, token, channelName) {
    var webSocket = null
    var joined = false

    Twitch.prototype.connect = () => {
        const ws = new WebSocket("wss://irc-ws.chat.twitch.tv:443")
        const joinChannel = (channel) => {
            if(joined) return
            ws.send('JOIN #' + channel)

            setTimeout(() => { joinChannel(channel) }, 5000)
        }

        ws.onopen = (event) => {
            console.log("Connection established. Logging in...")
            this.onconnect()
            ws.send("PASS " + token)
            ws.send("NICK " + username)
            joinChannel(channelName)
        }

        ws.onclose = (event) => {
            joined = false
            console.log("Connection closed.")
            this.ondisconnect()
            if(event.code == 11) return
            console.log("Reconnecting...")
            setTimeout(() => { this.connect() }, 2000)
        }

        ws.onmessage = (message) => {
            const messages = message.data.split('\r\n')
            messages.forEach(msg => {
                const parts = msg.split(' ')
                if(parts[0] == 'PING') {
                    console.log('SENDING PONG...')
                    ws.send('PONG :tmi.twitch.tv')
                    return
                }
    
                if(parts[1] == 'PRIVMSG') {
                    const username = parts[2].substring(1)
                    const message = parts.slice(3).join(' ').substring(1)
    
                    if(this.onmessage) this.onmessage({ username: username, message: message })
                    return
                }

                if(parts[1] == 'JOIN') {
                    joined = true
                    console.log("JOINED to " + parts[2])
                    this.onjoin(parts[2])
                }
            })
        }

        webSocket = ws
    }

    Twitch.prototype.disconnect = () => {
        if(webSocket) webSocket.close(11, "End connection")
    }

    Twitch.prototype.onmessage = (message) => {}
    Twitch.prototype.onconnect = () => {}
    Twitch.prototype.onjoin = (channel) => {}
    Twitch.prototype.ondisconnect = () => {}

    Twitch.prototype.send = (message, channel) => {
        webSocket.send(`PRIVMSG #${channel} :${message}`)
    }
}