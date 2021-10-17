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
    showNotification('❌ Improper setup detected. Mentega TTS can\'t start. ❌', false)
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
            .substring(0, 200) // Limits to 200 characters

        if(msg.substring(0, 1) == '!') return // Ignore message that starts with exclamation mark.
        const msgForLang = msg.length >= 35 ? msg : `${msg} `.repeat(25) // String too short for language detection, so let's just hack it!
        const lang = detectLanguage(msgForLang)
        const gTranslateLang = (lang) => {
            switch(lang.toLowerCase()) {
                case 'english':
                    return 'en-US'
                    break
                case 'japanese':
                    return 'ja'
                default:
                    return 'id_ID'
            }
        }
        speaker.speak(msg, gTranslateLang(lang))
    }

    twitch.onconnect = () => {
        showNotification('🧈 Mentega TTS Connected 🧈')
    }

    twitch.onjoin = (channel) => {
        showNotification(`🧈 Mentega TTS Joined ${channel} 🧈`)
    }

    twitch.ondisconnect = () => {
        showNotification('❌ Mentega TTS Disconnected ❌')
    }
}

// Replace 8888 with パチパチパチ (Except for easter egg users).
String.prototype.pachify = function (username) {
    const easterEggUsers = ['ngeq', 'amikarei', 'bagusnl', 'ozhy27', 'mentegagoreng', 'kalamus_pls', 'seiki_ryuuichi', 'cepp18_']
    const pachiRegex = /8{3,}/g
    const pachiReplacement = easterEggUsers.includes(username.toLowerCase()) ? 'panci panci panci' : 'パチパチパチ' // Context: 'panci' is Indonesian word for cooking pot. It sounds similar to 'パチ', hence the pun.
    const pachified = this.replace(pachiRegex, pachiReplacement)

    return pachified
}