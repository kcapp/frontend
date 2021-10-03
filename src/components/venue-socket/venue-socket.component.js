const io = require('../../util/socket.io-helper');
const localStorage = require('../../util/localstorage');

module.exports = {
    onCreate(input) {
        this.state = {
            venueId: undefined
        }
    },
    onMount() {
        const isController = localStorage.get('controller');
        const hasController = localStorage.get('has_controller');
        if (isController || hasController) {
            const venue = localStorage.get('venue_id');
            if (venue) {
                this.state.venueId = parseInt(venue);

                const socket = io.connect(`${window.location.origin}/venue/${this.state.venueId}`);
                socket.on('venue_new_match', (data) => {
                    if (location.pathname.endsWith(`/legs/${data.leg_id}`)) {
                        return;
                    }
                    location.href = `/legs/${data.leg_id}`;
                });

                socket.on('warmup_started', (data) => {
                    if (location.pathname.endsWith(`/legs/${data.leg.id}`)) {
                        return;
                    }
                    location.href = `/legs/${data.leg.id}`;
                });
            }
        }
    }
}
