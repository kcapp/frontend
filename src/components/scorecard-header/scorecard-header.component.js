var skill = require('kcapp-bot/bot-skill');

module.exports = {
    onCreate(input) {
        var player = input.player;

        var name = input.players[player.player_id].name;
        if (player.player.is_bot) {
            if (player.bot_config.player_id) {
                name = name + " as " + input.players[player.bot_config.player_id].name;
            } else {
                name = name + " (" + skill.fromInt(player.bot_config.skill_level).name + ")";
            }
        }
        this.state = {
            player: player,
            name: name,
            isCurrentPlayer: player.is_current_player,
            currentScore: player.current_score,
            wins: player.wins ? player.wins : 0
        }
    },
    setScored(scored) {
        this.state.currentScore -= scored;
    }
};