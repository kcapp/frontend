const io = require('../../../../../../util/socket.io-helper');
const axios = require('axios');

module.exports = {
    onCreate(input, out) {
        this.state = {
            match: undefined,
            venueId: input.venues[0].id,
            locals: out.global.kcapp
        }
    },
    onMount() {
        $(function() {
            $("#start-remote-modal").on('shown.bs.modal', function(){
                const matchId = $("#start-remote-modal").data('matchId');
                if (matchId) {
                    this.setMatch(matchId, true);
                }
            }.bind(this));
        }.bind(this));
    },
    onVenueChange(event) {
        this.state.venueId = parseInt(event.target.value);
    },
    setMatch(matchId) {
        const match = this.input.matches[matchId];
        this.state.match = match;
        this.state.venueId = match.venue ? match.venue.id : this.input.venues[0].id;
    },
    startRemote(event) {
        const socket = io.connect(`${window.location.origin}/venue/${this.state.venueId}`);
        socket.on("connect", () => {
            const match = this.state.match;
            match.venue = { id: this.state.venueId };

            axios.put(`${window.location.protocol}//${window.location.hostname}${this.state.locals.api_path}/match/${match.id}`, match)
                .then(response => {
                    this.state.venues = response.data;
                    socket.emit('start_remote', { match: match });
                    $("#start-remote-modal").modal('hide');
                }).catch(error => {
                    console.log('Error when updating match ' + error);
                    alert(`Error updating match ${error}`);
                });
        });
        event.preventDefault();
    }
}