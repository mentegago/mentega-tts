function Speaker(queueLimit = 5) {
    var audio = new Audio()
    var ttsQueue = []

    const playTTSQueue = () => {
        const topQueue = ttsQueue.shift()
        
        if(!topQueue) {
            setTimeout(() => { playTTSQueue() }, 1000) // Wait for one second and check queue again.
            return
        }

        const lang = topQueue.lang
        const text = topQueue.text
        const url = `https://translate.google.com/translate_tts?ie=UTF-8&tl=${lang}&client=tw-ob&q=${encodeURIComponent(text)}`

        audio = new Audio(url)        
        audio.play()
        audio.onended = (event) => {
            playTTSQueue()
        }
    }

    Speaker.prototype.speak = (text, lang = 'id_ID') => {
        while(ttsQueue.length >= queueLimit) ttsQueue.shift() // Limits queue length

        ttsQueue.push({
            lang: lang,
            text: text
        })
    }

    playTTSQueue()
}