exports.VOICES = [];

exports.getUtterance = function (data, callback) {
    const msg = new SpeechSynthesisUtterance();
    msg.volume = 1;
    msg.rate = 1.0;
    msg.pitch = 1;
    msg.text = data.text;
    msg.onend = () => {
        if (callback) {
            callback();
        }
    };
    msg.play = () => {
        console.log(`getUtterance: speechSynthesis.speak - pending: ${speechSynthesis.pending}, speaking: ${speechSynthesis.speaking} paused: ${speechSynthesis.paused}`);
        // Adding custom play method to allow easier chaining with audio elements
        speechSynthesis.cancel(); // Sometimes it gets stuck and refuses to speak any more, so cancel any existing before speaking again
        speechSynthesis.speak(msg);
    }
    return msg;
}

exports.getUtteranceWithVoice = function (data, voiceName, readyCallback, endCallback) {
    const msg = new SpeechSynthesisUtterance();
    msg.volume = 1;
    msg.rate = 1.0;
    msg.pitch = 1;
    msg.text = data.text;
    msg.onend = () => {
        if (endCallback) {
            endCallback();
        }
    };
    msg.play = () => {
        console.log(`getUtteranceWithVoice: speechSynthesis.speak - pending: ${speechSynthesis.pending}, speaking: ${speechSynthesis.speaking} paused: ${speechSynthesis.paused}`);        // Adding custom play method to allow easier chaining with audio elements
        speechSynthesis.cancel(); // Sometimes it gets stuck and refuses to speak any more, so cancel any existing before speaking again
        speechSynthesis.speak(msg);
    }
    this.getVoice(voiceName, (voice) => {
        msg.voice = voice;
        if (readyCallback) {
            readyCallback(msg);
        }
    });
    return msg;
}

exports.loadVoices = function(callback) {
    function getVoices() {
        this.VOICES = speechSynthesis.getVoices();
        callback(this.VOICES);
    }
    if (this.VOICES.length === 0) {
        if ('onvoiceschanged' in speechSynthesis) {
            speechSynthesis.onvoiceschanged = getVoices.bind(this);
        }
        getVoices.bind(this)();
    } else {
        callback(this.VOICES);
    }
}

exports.getVoice = function(name, callback) {
    this.loadVoices((voices) => {
        let voice = voices.filter(voice => voice.name === name)[0];
        callback(voice);
    });
}

exports.speak = function (data, callback) {
    const msg = this.getUtterance(data, callback);
    msg.play();
};

exports.speakWithVoice = function (data, voiceName, endCallback) {
    this.getUtteranceWithVoice(data, voiceName, (msg) => {
        msg.play();
    }, endCallback);
};
