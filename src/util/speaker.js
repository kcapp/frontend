exports.speak = (data) => {
    var msg = new SpeechSynthesisUtterance();
    msg.volume = 1;
    msg.rate = 1.0;
    msg.pitch = 1;
    msg.text = data.text;
    speechSynthesis.speak(msg);
    return msg;
};
