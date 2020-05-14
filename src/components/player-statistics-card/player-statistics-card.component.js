var _ = require("underscore");
var types = require("../scorecard/components/match_types");

module.exports = {
    onCreate(input) {
        var leg = input.leg;
        var match = input.match;
        var player = input.player;

        var isWinner = leg ? leg.winner_player_id === player.id : match.winner_id === player.id;

        if (match.match_type.id === types.SHANGHAI) {
            // If match finished with a shanghai, set the number on each player to display statistics correctly
            var shanghai = _.find(input.statistics, (statistic) => statistic.shanghai !== null);
            if (shanghai) {
                _.each(input.statistics, (statistic) => statistic.shanghai = shanghai.shanghai );
            }
        }
        this.state = {
            isWinner: isWinner
        }
    }
}