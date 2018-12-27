const axios = require('axios');
const alertify = require("../../../../util/alertify");

module.exports = {
    onInput(input) {
        this.state = {
            legId: input.legId,
            round: input.round
        }
    },
    editScores(event) {
        location.href = '/legs/' + this.state.legId + '/result#visits';
    },
    changeOrder(event) {
        // Modal is displayed, and code is handled in player-order component
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