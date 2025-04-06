const io = require('../../util/socket.io-helper');
const localStorage = require('../../util/localstorage');

module.exports = {
    onCreate(input) {
        this.state = {
            venueId: undefined
        }
    },
    onMount() {
        const isController = localStorage.getBool('controller', false);
        const hasController = localStorage.getBool('has_controller', false);
        const isRemote = localStorage.getBool('remote-control', false);
        if (isController || hasController || isRemote) {
            const venue = localStorage.get('venue_id');
            if (venue) {
                this.state.venueId = parseInt(venue);

                const socket = io.connect(`${window.location.origin}/venue/${this.state.venueId}`);
                socket.on('venue_new_match', (data) => {
                    if (location.pathname.endsWith(`/legs/${data.leg_id}`) || location.pathname.endsWith(`/legs/${data.leg_id}/controller`)) {
                        return;
                    }
                    location.href = isController ? `/legs/${data.leg_id}/controller` :`/legs/${data.leg_id}`;
                });

                socket.on('warmup_started', (data) => {
                    if (location.pathname.endsWith(`/legs/${data.leg.id}`) || location.pathname.endsWith(`/legs/${data.leg.id}/controller`)) {
                        return;
                    }
                    location.href = isController ? `/legs/${data.leg.id}/controller` : `/legs/${data.leg.id}`;
                });

                socket.on('start_remote', (data) => {
                    location.href = isController ? `/legs/${data.match.current_leg_id}/controller` : `/legs/${data.match.current_leg_id}`;
                });
            }
        }
    }
}
