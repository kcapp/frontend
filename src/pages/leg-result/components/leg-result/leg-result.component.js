var moment = require("moment");
var axios = require("axios");
var alertify = require("../../../../util/alertify");

module.exports = {
    onCreate(input) {
        var leg = input.leg;

        leg.started = moment(leg.created_at).format('YYYY-MM-DD HH:mm:ss');
        leg.finished = leg.end_time === null ? '-' : moment(leg.end_time).format('YYYY-MM-DD HH:mm:ss');
        leg.duration = "-";
        if (leg.visits.length > 0) {
            leg.duration = moment.duration(moment(leg.end_time).diff(leg.visits[0].created_at)).asMinutes().toFixed();
        }
        this.state = {
            leg: leg,
            matchId: leg.match_id
        }
    },
    onMount() {
        document.addEventListener("keydown", this.onKeyDown.bind(this), false);
    },
    onKeyDown(e) {
        switch (e.key) {
            case 'Enter':
                this.continueMatch();
                e.preventDefault();
                break;
            case '.':
            case 'Backspace':
            case 'PageUp': // Intentional fall-through
                this.viewMatchResult();
                e.preventDefault();
                break;
            default: // NOOP
        }
    },
    continueMatch(event) {
        if (this.input.match.is_finished) {
            return;
        }
        location.href = '/matches/' + this.state.matchId;
    },
    viewMatchResult(event) {
        location.href = '/matches/' + this.state.matchId + '/result';
    },
    undoLegFinish(event) {
        alertify.confirm('Leg will no longer be finalized',
            () => {
                axios.put(window.location.origin + '/legs/' + this.state.leg.id + '/undo', null)
                    .then(response => {
                        location.href = '/legs/' + this.state.leg.id;
                    }).catch(error => {
                        alert('Unable to undo leg, see log for details (' + error.statusText + ')');
                    });
            }, () => { /* NOOP */ });
    },
    rematch(event) {
        axios.post(window.location.origin + '/matches/' + this.state.matchId + '/rematch', null)
            .then(response => {
                location.href = '/legs/' + response.data.current_leg_id
            }).catch(error => {
                alert('Unable to undo leg, see log for details (' + error.statusText + ')');
            });
    }
}