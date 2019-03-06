var moment = require("moment");

module.exports = {
    onCreate(input) {
        var leg = input.leg;
        var match = input.match;
        var player = input.player;

        var isWinner = leg ? leg.winner_player_id === player.id : match.winner_id === player.id;
        this.state = {
            isWinner: isWinner
        }
    }
}