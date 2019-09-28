module.exports = {
    onInput(input) {
        this.state = {
            round: input.round,
            enableAnnouncement: false
        }
    },
    enableVoiceAnnouncement(event) {
        var enable = !this.state.enableAnnouncement;
        this.emit('enable-announcement', enable);
        this.state.enableAnnouncement = enable;
    }
};