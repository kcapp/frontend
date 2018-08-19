const _ = require("underscore");
module.exports = {
    onCreate() {

    },

    onInput(input) {
        this.state = {
            selected: input.selected
        }
    },

    comparePlayers(event) {
        var params = '?';
        for (var i = 0; i < this.state.selected.length; i++) {
            params += 'player_id=' + this.state.selected[i] + '&';
        }
        location.href = '/players/compare' + params;
    },
    addPlayer(event) {
        this.emit('add-player');
    }
}