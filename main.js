const clientParams = new URLSearchParams(`?${window.location.hash.substring(1)}`)
const username = clientParams.has('username') ? clientParams.get('username').toLowerCase() : null
const token = clientParams.has('token') ? clientParams.get('token') : null
const channel = clientParams.has('channel') ? clientParams.get('channel').toLowerCase() : null
const hideNotifications = clientParams.has('hideNotifications') ? clientParams.get('hideNotifications').toLowerCase() === 'true' : false
const notificationDOM = document.querySelector('#notification')

// Show notifications on top left screen
var notificationTimerId = null
function showNotification(notification, autoHide = true) {
    if(hideNotifications) return;
    if(notificationTimerId) {
        clearTimeout(notificationTimerId)
        notificationTimerId = null
    }
    notificationDOM.innerHTML = notification
    notificationDOM.style.display = 'block'

    if(autoHide) notificationTimerId = setTimeout(() => { 
        notificationDOM.innerHTML = ''
        notificationDOM.style.display = 'none'
    }, 2000)
}

// tmi.js doesn't require username nor token unless we want to send a message.
// For now, these parameters are unused.
// if(!username || !token || !channel) {
if (!channel) {
    showNotification('❌ Improper setup detected. Read README.md for installation instruction! ❌', false)
} else {
    const twitch = new tmi.Client({
        channels: [channel]
    })

    const speaker = new Speaker()

    twitch.connect()

    twitch.on('message', (channel, tags, message, self) => {
        const msg = message
            .removeEmotes(tags['emotes'])
            .replace(/\s{2,}/g, ' ')
            .replace(/(?:https?|ftp):\/\/[\n\S]+/g, '') // Remove all URLs.
            .pachify(tags['username']) // パチfy!
            .warafy(tags['username']) // わらfy!
            .substring(0, 200) // Limits to 200 characters

        if(msg.substring(0, 1) == '!') return // Ignore message that starts with exclamation mark.
        if(msg.trim().length == 0) return // Ignore messages that are empty after filtering.

        // Start message with 'ID ', 'EN ', or 'JP ' to force the TTS to use a specific language voice.
        const forcedLanguage = (() => {
            const forcedLanguageString = msg.substring(0, 3).toLowerCase()
            switch(forcedLanguageString) {
                case 'id ':
                    return 'ind'
                case 'en ':
                    return 'eng'
                case 'jp ':
                    return 'jpn'
            }

            return null
        })()

        const msgForLang = msg.length >= 35 ? msg : `${msg} `.repeat(25) // String too short for language detection, so let's just hack it!
        const lang = forcedLanguage || msgForLang.language()
        const gTranslateLang = (lang) => {
            switch(lang.toLowerCase()) {
                case 'eng':
                    return 'en-US'
                case 'jpn':
                    return 'ja'
                default:
                    return 'id_ID'
            }
        }
        const messageToSpeak = forcedLanguage ? msg.substring(3) : msg
        speaker.speak(`${tags['username']}, ${messageToSpeak}`, gTranslateLang(lang))
    })

    twitch.on('connected', () => {
        showNotification('🧈 Mentega TTS connected to Twitch 🧈')
    })

    twitch.on('join', (channel, username) => {
        showNotification(`🧈 Mentega TTS joined ${channel} 🧈`)
    })
    
    twitch.on('disconnected', () => {
        showNotification('❌ Mentega TTS disconnected ❌')
    })

    twitch.on('part', (channel, nick, isSelf) => {
        if(isSelf) {
            showNotification(`👋 Mentega TTS left ${channel} 👋`)
        }
    })
}

// Replace 8888 with パチパチパチ (Except for easter egg users).
String.prototype.pachify = function (username) {
    const easterEggUsers = ['ngeq', 'amikarei', 'bagusnl', 'ozhy27', 'kalamus_pls', 'seiki_ryuuichi', 'cepp18_', 'mentegagoreng', 'sodiumtaro']
    const pachiRegex = /8{3,}/g
    const pachiReplacement = easterEggUsers.includes(username.toLowerCase()) ? 'panci panci panci' : 'パチパチパチ' // Context: 'panci' is Indonesian word for cooking pot. It sounds similar to 'パチ', hence the pun.
    const pachified = this.replace(pachiRegex, pachiReplacement)

    return pachified
}

String.prototype.warafy = function (username) {
    const waraRegex = /(( |^|\n|\r)(w|ｗ)+( |$|\n|\r))/g
    const waraReplacement = 'わらわら'
    const warafied = this.replace(waraRegex, waraReplacement)

    return warafied
}

String.prototype.replaceCommonAbbreviations = function (username) {
    const commonAbbreviations = [
        ['gw', 'gue'], ['pls', 'please'], ['iy', 'iya'], ['ngl', 'not gonna lie'], ['tbh', 'to be honest']
    ]
}

String.prototype.language = function() {
    if(this.includes('panci panci panci')) return 'ind' // Handle easter egg
    return franc(this, { whitelist: ['eng', 'jpn', 'ind'] })
}

String.prototype.clearRange = function (from, to) {
    return this.substring(0, from) + ' '.repeat(to-from) + this.substring(to);
}

String.prototype.removeEmotes = function(emotes) {
    if(!emotes) return this

    var clearedMessage = this
        Object
            .keys(emotes)
            .forEach(key => {
                const emoteRanges = emotes[key]
                emoteRanges.forEach(rangeString => {
                    const range = rangeString
                        .split('-', 2)
                        .map(value => parseInt(value.trim()))

                    clearedMessage = clearedMessage.clearRange(range[0], range[1]+1)
                })
            })
            
    return clearedMessage
}