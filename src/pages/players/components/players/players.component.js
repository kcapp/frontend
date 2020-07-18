var _ = require("underscore");

module.exports = {
    onCreate(input) {
        this.state = {
            players: input.players
        }
    },

    officeChanged(officeId) {
        if (officeId == 0) {
            this.state.players = this.input.players;
        } else {
            this.state.players = _.reject(this.input.players, (player) => {
                return player.office_id != officeId ;
            });
        }
        this.setStateDirty("players");
    }
};