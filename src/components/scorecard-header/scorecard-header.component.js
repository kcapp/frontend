const skill = require('kcapp-bot/bot-skill');

module.exports = {
    onCreate(input) {
        const player = input.player;

        let name = input.players[player.player_id].name;
        if (player.player.is_bot) {
            if (player.bot_config.player_id) {
                name = `${name} as ${input.players[player.bot_config.player_id].name}`;
            } else {
                name = `${name} (${skill.fromInt(player.bot_config.skill_level).name})`;
            }
        }
        this.state = {
            player: player,
            name: name,
            wins: player.wins ? player.wins : 0,
            cameraEnabled: true
        }
    },
    onInput(input) {
        this.state.player = input.player;
        this.state.wins = this.state.player.wins ? this.state.player.wins : 0;
    },
    onMount() {
        if (this.state.player.player.board_stream_url && this.state.player.player.board_stream_css) {
            $("iframe").ready(function() {
                setTimeout(() => {
                    // Give the video a few seconds to load
                    const iframe = document.getElementById(`iframe-player-cam-${this.state.player.player_id}`);
                    iframe.contentWindow.postMessage( { "style" : this.state.player.player.board_stream_css }, '*');
                }, 2000);
            }.bind(this));
        }
    },
    setScored(scored) {
        this.setStateDirty('player');
    },
    toggleCamera() {
        this.state.cameraEnabled = !this.state.cameraEnabled;
        this.emit("toggle-camera", this.state.cameraEnabled);
    }
};
