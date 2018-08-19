const _ = require("underscore");
module.exports = {
    onCreate() {

    },

    onInput(input) {
        this.state = {
            selected: input.selected
        }
    },

    viewPlayer(event, element) {
        var playerId = element.attributes['data-player'].value;
        location.href = '/players/' + playerId + '/statistics'
    },
    playerChecked(event, element) {
        var playerId = parseInt(element.value);
        if (element.checked) {
            this.state.selected.push(parseInt(element.value));
        } else {
            this.state.selected = _.without(this.state.selected, playerId);
        }
        this.emit('player-checked', playerId);
    }
}