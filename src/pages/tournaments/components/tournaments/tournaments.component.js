const _ = require("underscore");
const moment = require("moment");

module.exports = {
    onCreate(input) {
        const tournaments = [];
        const seasons = [];
        for (let i = 0; i < input.tournaments.length; i++) {
            const tournament = input.tournaments[i];
            tournament.start_time = moment(tournament.start_time).format('YYYY-MM-DD HH:mm');
            tournament.end_time = moment(tournament.end_time).format('YYYY-MM-DD HH:mm');

            if (tournament.is_season) {
                seasons.push(tournament);
            } else {
                tournaments.push(tournament);
            }
        }

        this.state = {
            tournaments: tournaments,
            seasons: seasons
        }
    },

    officeChanged(officeId) {
        if (officeId == 0) {
            this.state.tournaments = _.reject(this.input.tournaments, (tournament) => tournament.is_season );
            this.state.seasons = _.reject(this.input.tournaments, (tournament) => !tournament.is_season );
        } else {
            this.state.tournaments = _.reject(this.input.tournaments, (tournament) =>  tournament.is_season || tournament.office_id != officeId);
            this.state.seasons = _.reject(this.input.tournaments, (tournament) => !tournament.is_season || tournament.office_id != officeId);
        }
        this.setStateDirty("tournaments");
        this.setStateDirty("seasons");
    }
};