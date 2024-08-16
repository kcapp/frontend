const speaker = require("../../../../util/speaker");

module.exports = {
    onCreate(input) {
        this.state = {
            voices: []
        };
    },

    onMount() {
        $(function () {
            speaker.loadVoices((voices) => {
                if (voices && voices.length > 0) {
                    this.state.voices = voices;
                }
            });
        }.bind(this));
    }
}