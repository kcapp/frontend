const localStorage = require('../../../../util/localstorage');

module.exports = {
    onCreate(input) {
        this.state = {
            round: input.round,
            enableAnnouncement: false
        }
    },
    onMount() {
        this.state.enableAnnouncement = localStorage.getBool('spectate-announcements', false);
        this.emit('enable-announcement', this.state.enableAnnouncement);
    },
    enableVoiceAnnouncement(event) {
        const enable = !this.state.enableAnnouncement;
        this.emit('enable-announcement', enable);
        this.state.enableAnnouncement = enable;

        localStorage.set('spectate-announcements', enable);
    }
};