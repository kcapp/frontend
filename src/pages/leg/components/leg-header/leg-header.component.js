var axios = require('axios');
var alertify = require("../../../../util/alertify");
var types = require("../../../../components/scorecard/components/match_types");

module.exports = {
    onCreate(input) {
        var simpleInputSupported = types.SUPPORT_SIMPLE_INPUT.includes(input.match.match_type.id);
        this.state = {
            legId: input.legId,
            simpleInput: {
                supported: simpleInputSupported,
                enable: false,
            },
            streamEnabled: false
        }
    },

    changeOrder(event) {
        // Modal is displayed, and code is handled in player-order component
    },
    enableSimiplifiedInput(event) {
        this.state.simpleInput.enable = !this.state.simpleInput.enable;
        this.setStateDirty("simpleInput");
        this.emit("enable-simple-input", this.state.simpleInput.enable);
    },

    enableBoardStream(id, event) {
        var data = {
            board: id,
            enabled: !this.state.streamEnabled
        };
        this.emit('enable-stream', data);
        this.state.streamEnabled = !this.state.streamEnabled;
    },

    cancelLeg(event) {
        alertify.confirm('Leg will be cancelled.', () => {
            axios.delete(window.location.origin + '/legs/' + this.state.legId + '/cancel')
                .then(response => {
                    location.href = '/matches';
                }).catch(error => {
                    alert('Unable to cancel leg. Reload and try again');
                });
        }, () => { /* NOOP */ });
    }
};