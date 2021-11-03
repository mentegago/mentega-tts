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

    showNotification('💭 Connecting... 💭')
    twitch.connect()

    twitch.on('message', async (channel, tags, message, self) => {
        const msg = message
            .removeEmotes(tags['emotes'])
            .replaceCommonAbbreviations(tags['username'])
            .replace(/\s{2,}/g, ' ')
            .replace(/(?:https?|ftp):\/\/[\n\S]+/g, '') // Remove all URLs.
            .pachify(tags['username']) // パチfy!
            .warafy(tags['username']) // わらfy!
            .substring(0, 200) // Limits to 200 characters

        if(msg.substring(0, 1) == '!') {
            handleCommand(tags['username'], msg)
            return // Ignore message that starts with exclamation mark.
        }
        if(msg.trim().length == 0) return // Ignore messages that are empty after filtering.

        // Start message with 'ID ', 'EN ', or 'JP ' to force the TTS to use a specific language voice.
        const forcedLanguage = (() => {
            const forcedLanguageString = msg.substring(0, 3).toLowerCase()
            if(forcedLanguageString == 'id' || forcedLanguageString == 'en' || forcedLanguageString == 'jp') return forcedLanguageString
            return null
        })()

        const lang = forcedLanguage || await getLanguage(msg)
        const messageToSpeak = forcedLanguage ? msg.substring(3) : msg
        
        speaker.speak(`${tags['username']}, ${messageToSpeak}`, lang)
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

    const handleCommand = (user, message) => {
        if(!username) return // User has not set username.
        if(user.toLowerCase() != username) return

        const msg = message
            .toLowerCase()
            .trim()
            .split(' ')

        if(msg[0] == '!join') {
            const targetChannel = msg[1].trim()
            twitch.join(targetChannel)
        } else if(msg[0] == '!leave') {
            const targetChannel = msg[1].trim()
            if(targetChannel == channel) {
                showNotification('❌ Cannot leave main channel! ❌')
            } else {
                twitch.leave(targetChannel)
            }
        }
    }
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
        ['gw', 'gue'], ['pls', 'please'], ['iy', 'iya'], ['ngl', 'not gonna lie'], ['tbh', 'to be honest'], ['ngl', 'not gonna lie'], ['wtf', 'what the fried butter']
    ]

    var text = this.toLowerCase()

    // Replace words in commonAbbreviations with their full word.
    for(const abbreviation of commonAbbreviations) {
        const regex = new RegExp(`( |^|\n|\r)(${abbreviation[0]})( |$|\n|\r)`, 'g')
        const replacement = `$1${abbreviation[1]}$3`
        text = text.replace(regex, replacement)
    }

    return text
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

// Get language of text from Google Translate (using fetch).
const getLanguage = async (text) => {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=en&dt=t&q=${encodeURIComponent(text)}`
    try {
        const response = await fetch(url)
        if(!response.ok) throw new Error(`${response.status} ${response.statusText}`)
        const json = response.json()
        const lang = json[2]

        if(lang == 'en' || lang == 'ja' || lang == 'id') return lang
        return getLanguageFranc(text)
    } catch(error) {
        console.error(error)
        return getLanguageFranc(text)
    }
}

// Get Language using Franc.
const getLanguageFranc = (text) => {
    const msgForLang = text.length >= 35 ? text : `${text} `.repeat(25) // String too short for language detection, so let's just hack it!
    const francLang = franc(msgForLang, { whitelist: ['eng', 'jpn', 'ind'] })

    switch(francLang) {
        case 'eng':
            return 'en'
        case 'jpn':
            return 'ja'
        default:
            return 'id'
    }
}