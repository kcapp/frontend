const skill = require('kcapp-bot/bot-skill');
const localStorage = require("../../util/localstorage");
const types = require("../scorecard/components/match_types");

module.exports = {
    onCreate(input) {
        const player = input.player;

        let name = input.players[player.player_id].name;
        if (player.player.is_bot) {
            if (!player.bot_config) {
                name = `${name} (${skill.fromInt(skill.MEDIUM.skill).name})`;
            } else if (player.bot_config.player_id) {
                name = `${name} as ${input.players[player.bot_config.player_id].name}`;
            } else {
                name = `${name} (${skill.fromInt(player.bot_config.skill_level).name})`;
            }
        }

        const avgs = { show: (input.type === types.X01 || input.type === types.X01HANDICAP), running: null, firstNine: null };
        this.state = {
            player: player,
            name: name,
            wins: player.wins ? player.wins : 0,
            cameraEnabled: true,
            displayAvgs: true,
            avgs: avgs
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
        this.computeAvgs(this.input.leg, this.state.player);
        this.state.displayAvgs = localStorage.getBool("display-avgs", true);
    },
    setScored(scored) {
        this.setStateDirty('player');
    },
    toggleCamera() {
        this.state.cameraEnabled = !this.state.cameraEnabled;
        this.emit("toggle-camera", this.state.cameraEnabled);
    },
    computeAvgs(leg, player) {
        // Compute the live running 3-dart average and the first-9 average for an X01
        // or X01HANDICAP player, using only fields that the server updates atomically
        // on visit commit: `player.darts_thrown` for the dart count, and the sum of
        // `visit.score` over `leg.visits` for the score. Deliberately avoids
        // `player.current_score`, which is mutated dart-by-dart on the client when
        // `subtract_per_dart` is enabled and would produce wrong intermediate values.
        const darts = (player && player.darts_thrown) || 0;
        if (darts === 0) {
            this.state.avgs = { show: true, running: null, firstNine: null };
            return;
        }

        let totalScore = 0;
        let firstNineScore = 0;
        let visitCount = 0;
        if (leg && leg.visits) {
            for (const visit of leg.visits) {
                if (visit.player_id !== player.player_id) continue;
                if (!visit.is_bust) {
                    totalScore += visit.score || 0;
                    if (visitCount < 3) {
                        firstNineScore += visit.score || 0;
                    }
                }
                visitCount++;
            }
        }

        const running = totalScore / darts * 3;

        let firstNine = null;
        if (darts >= 9) {
            firstNine = firstNineScore / 9 * 3;
        } else if (leg && leg.is_finished) {
            // Leg ended in fewer than 9 darts (fast 301 checkout). Mirror the
            // post-match `CalculateX01Statistics` formula so the live value seen
            // briefly before the page transitions matches the Match Result card.
            firstNine = running;
        }

        this.state.avgs = { show: true, running, firstNine };
    }
};
