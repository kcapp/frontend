var _ = require("underscore");

module.exports = {
    onCreate(input) {
        this.state = {
            general: input.general,
            tournament: input.tournament
        }
    },
    officeChanged(officeId) {
        if (officeId == 0) {
            this.state.tournament = this.input.tournament;
            this.state.general = this.input.general;
        } else {
            this.state.tournament = _.reject(this.input.tournament, (elo) => {
                return this.input.players[elo.player_id].office_id != officeId ;
            });
            this.state.general = _.reject(this.input.general, (elo) => {
                return this.input.players[elo.player_id].office_id != officeId ;
            });
        }
        this.setStateDirty("tournament");
        this.setStateDirty("general");
    }
}
