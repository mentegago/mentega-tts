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

if(!username || !token || !channel) {
    showNotification('❌ Improper setup detected. Read README.md for installation instruction! ❌', false)
} else {
    const twitch = new Twitch(
        username, 
        token.substring(0, 'oauth:'.length) == 'oauth:' ? token : `oauth:${token}`, // Prepend 'oauth:' if user did not put it in.
        channel
    )
    const speaker = new Speaker()

    twitch.connect()

    twitch.onmessage = (message) => {
        const msg = message.message
            .replace(/(?:https?|ftp):\/\/[\n\S]+/g, '') // Remove all URLs.
            .pachify(message.username) // パチfy!
            .warafy(message.username) // わらfy!
            .substring(0, 200) // Limits to 200 characters

        if(msg.substring(0, 1) == '!') return // Ignore message that starts with exclamation mark.

        // Start message with 'ID ', 'EN ', or 'JP ' to force the TTS to use a specific language voice.
        const forcedLanguage = (() => {
            const forcedLanguageString = msg.substring(0, 3).toLowerCase()
            switch(forcedLanguageString) {
                case 'id ':
                    return 'indonesia'
                case 'en ':
                    return 'english'
                case 'jp ':
                    return 'japanese'
            }

            return null
        })()

        const msgForLang = msg.length >= 35 ? msg : `${msg} `.repeat(25) // String too short for language detection, so let's just hack it!
        const lang = forcedLanguage || franc(msgForLang, { whitelist: ['eng', 'jpn', 'ind'] })
        console.log(`Language: ${lang}`)
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
        speaker.speak(`${message.username}, ${messageToSpeak}`, gTranslateLang(lang))
    }

    twitch.onconnect = () => {
        showNotification('🧈 Mentega TTS connect to Twitch 🧈')
    }

    twitch.onjoin = (channel) => {
        showNotification(`🧈 Mentega TTS joined ${channel} 🧈`)
    }

    twitch.ondisconnect = () => {
        showNotification('❌ Mentega TTS disconnected ❌')
    }

    twitch.onleave = (channel) => {
        showNotification(`👋 Mentega TTS left ${channel} 👋`)
    }

    twitch.oncommanderror = (message) => {
        showNotification(`❌ ${message} ❌`)
    }
}

// Replace 8888 with パチパチパチ (Except for easter egg users).
String.prototype.pachify = function (username) {
    const easterEggUsers = ['ngeq', 'amikarei', 'bagusnl', 'ozhy27', 'kalamus_pls', 'seiki_ryuuichi', 'cepp18_', 'mentegagoreng']
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