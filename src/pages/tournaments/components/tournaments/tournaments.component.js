const _ = require("underscore");
const moment = require("moment");

module.exports = {
    onCreate(input) {
        const tournaments = input.tournaments;
        for (let i = 0; i < tournaments.length; i++) {
            const tournament = tournaments[i];
            tournament.start_time = moment(tournament.start_time).format('YYYY-MM-DD HH:mm');
            tournament.end_time = moment(tournament.end_time).format('YYYY-MM-DD HH:mm');
        }
        this.state = {
            tournaments: tournaments
        }
    },

    officeChanged(officeId) {
        if (officeId == 0) {
            this.state.tournaments = this.input.tournaments;
        } else {
            this.state.tournaments = _.reject(this.input.tournaments, (tournament) => {
                return tournament.office_id != officeId ;
            });
        }
        this.setStateDirty("tournaments");
    }
};