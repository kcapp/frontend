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
        // Adding custom play method to allow easier chaining with audio elements
        speechSynthesis.speak(msg);
    }
    return msg;
}

exports.speak = function (data, callback) {
    const msg = this.getUtterance(data, callback);
    speechSynthesis.speak(msg);
    return msg;
};

