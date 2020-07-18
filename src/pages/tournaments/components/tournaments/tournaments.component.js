var _ = require("underscore");

module.exports = {
    onCreate(input) {
        this.state = {
            tournaments: input.tournaments
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