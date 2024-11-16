const axios = require("axios");
const moment = require("moment");

module.exports = {
    onCreate(input) {
        const match = input.match;

        match.started = moment(match.created_at).format('YYYY-MM-DD HH:mm:ss');
        match.finished = match.end_time === undefined ? '-' : moment(match.end_time).format('YYYY-MM-DD HH:mm:ss');

        if (match.first_throw_time !== null) {
            match.duration = moment.duration(moment(match.last_throw_time).diff(match.first_throw_time)).asMinutes().toFixed();
        } else {
            match.duration = moment.duration(moment(match.end_time).diff(match.created_at)).asMinutes().toFixed();
        }


        this.state = {
            match: match
        }
    },
    onMount() {
        document.addEventListener("keydown", this.onKeyDown.bind(this), false);

        // Don´t forward playoff matches
        if (this.state.match.tournament && !this.state.match.tournament.is_playoffs) {
            const finishedParam = new URLSearchParams(window.location.search).get('finished');
            if (finishedParam) {
                // Move back to index page after 2 minutes
                setTimeout(() => {
                    location.href = '/';
                }, 120*1000);
            }
        }
    },
    onKeyDown(e) {
        switch (e.key) {
            case '1':
            case '2':
            case '3':
            case '4':
            case '5':
            case '6':
            case '7':
            case '8':
            case '9':
                const idx = parseInt(e.key) - 1; // Match array index
                const leg = this.state.match.legs[idx];
                if (leg) {
                    location.href = `/legs/${leg.id}/result`;
                }
                break;
            default: // NOOP
        }
    },
    onRematch() {
        axios.post(`${window.location.origin}/matches/${this.state.match.id}/rematch`, null)
            .then(response => {
                location.href = `/legs/${response.data.current_leg_id}`;
            }).catch(error => {
                alert(`Unable to rematch, see log for details (${error.statusText})`);
            });
    },
    onNextMatch() {
        axios.get(`${window.location.origin}/tournaments/match/${this.state.match.id}/next`, null)
            .then(response => {
                if (response.data === 204) {
                    location.href = `/tournaments/${this.state.match.tournament_id}`;
                } else {
                    const leg = response.data.legs[0];
                    location.href = leg.is_finished ? `/legs/${leg.id}/result` : `/legs/${leg.id}`;
                }
            }).catch(error => {
                alert(`Unable to get next match, see log for details (${error.statusText})`);
            });
    }
}