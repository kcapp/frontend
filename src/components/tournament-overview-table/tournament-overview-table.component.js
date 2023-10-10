const _ = require("underscore");

module.exports = {
    onCreate(input) {
        this.state = {
            // Filter out "placeholder"-players without any name
            overview: _.filter(input.overview, player => input.players[player.player_id].name !== ""),
            hasStatistics: !_.isEmpty(input.statistics)
        }
    },
    onMount() {
        $(function() {
            $('[data-toggle="tooltip"]').tooltip();
          });
    }
}