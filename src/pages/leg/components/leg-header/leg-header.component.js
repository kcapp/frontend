var axios = require('axios');
var alertify = require("../../../../util/alertify");

module.exports = {
    onCreate(input) {
        this.state = {
            legId: input.legId,
            streamEnabled: false
        }
    },

    editScores(event) {
        location.href = '/legs/' + this.state.legId + '/result#visits';
    },

    changeOrder(event) {
        // Modal is displayed, and code is handled in player-order component
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