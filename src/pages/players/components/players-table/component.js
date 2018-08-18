const _ = require("underscore");
module.exports = {
    onCreate() {

    },

    onInput(input) {
        this.state = {
            selected: []
        }
    },

    viewPlayer(event, element) {
        var playerId = element.attributes['data-player'].value;
        location.href = '/players/' + playerId + '/statistics'
    },
    playerSelected(event, element) {
        var playerId = parseInt(element.value);
        if (element.checked) {
            this.state.selected.push(parseInt(element.value));
        } else {
            this.state.selected = _.without(this.state.selected, playerId);
        }
    },

    comparePlayers(event) {
        console.log(event);
        var queryParameters = '?';
        for (var i = 0; i < this.state.selected.length; i++) {
            query += 'player_id=' + this.state.selected[i] + '&';
        }
        location.href = '/players/compare' + queryParameters;
    }
}