const _ = require("underscore");
const io = require('socket.io-client');
const axios = require('axios');

module.exports = {
    onCreate(input) {
        const socket = io('http://localhost:3000/legs/' + input.leg.id);

        var roundNumber = Math.floor(input.leg.visits.length / input.leg.players.length) + 1;
        var matchName = input.match.match_mode.short_name;
        this.state = {
            socket: socket,
            legId: input.leg.id,
            roundNumber: roundNumber,
            matchName: matchName,
            submitting: false
        }

        socket.on('connect', (data) => {
            socket.emit('join', 'Client Connecting');
        });

        socket.on('error', (data) => {
            console.log(data);
        });
    },

    onMount() {
        document.addEventListener("keydown", this.onKeyDown.bind(this), false);
        document.addEventListener("keypress", this.onKeyPress.bind(this), false);

        this.state.socket.on('score_update', this.onScoreUpdate.bind(this));
    },

    onScoreUpdate(data) {
        this.state.submitting = false;

        var leg = data.leg;
        // Update round number
        this.state.roundNumber = Math.floor(leg.visits.length / leg.players.length) + 1;

        var scorecardComponents = this.getComponents('players');
        for (var i = 0; i < scorecardComponents.length; i++) {
            var component = scorecardComponents[i];
            var isCurrentPlayer = component.state.playerId === leg.current_player_id;
            if (isCurrentPlayer) {
                component.reset();
            }
            component.state.isCurrentPlayer = isCurrentPlayer;
        }

        // Set updated score per player
        var players = data.players;
        for (var i = 0; i < players.length; i++) {
            var player = players[i];
            var scoreHeaderComponent = this.getComponent('player-' + player.player_id);
            scoreHeaderComponent.state.currentScore = player.current_score;
            scoreHeaderComponent.state.isCurrentPlayer = player.player_id === leg.current_player_id;
        }
    },
    onScoreChange(scored, component) {
        var component = this.findActive(this.getComponents('players'));
        this.getComponent('player-' + component.state.playerId).setScored(scored);
    },

    onPlayerBusted(busted, component) {
        if (busted) {
            this.state.socket.emit('throw', JSON.stringify(component.getPayload()));
            component.state.player.current_score += component.state.totalScore;
        } else {
            this.state.submitting = false;
        }
    },
    onLegFinished(finished, component) {
        if (finished) {
            axios.post(window.location.origin + '/legs/' + this.state.legId + '/finish', component.getPayload())
                .then(response => {
                    location.href = window.location.origin + '/legs/' + this.state.legId + '/result';
                }).catch(error => {
                    console.log(error);
                });
        } else {
            this.state.submitting = false;
        }
    },
    onKeyDown(e) {
        if (e.key === 'Backspace') {
            var component = this.findActive(this.getComponents('players'));
            component.removeLast();
            e.preventDefault();
        }
        return;
    },
    onKeyPress(e) {
        if (this.state.submitting) {
            // Don't allow input while score is being submitted
            return;
        }
        var component = this.findActive(this.getComponents('players'));

        var text = '';
        var currentValue = component.getCurrentValue();
        var currentMultiplier = component.getCurrentMultiplier();
        switch (e.key) {
            case 'Enter':
                var dartsThrown = component.getDartsThrown();
                if (dartsThrown > 3) {
                    this.state.submitting = true;
                    this.state.socket.emit('throw', JSON.stringify(component.getPayload()));
                } else {
                    this.state.submitting = component.confirmThrow();
                }
                return;
            case '/': // Single
                currentMultiplier = 1;
                break;
            case '*': // Double
                currentMultiplier = 2;
                break;
            case ',': // Triple
            case '.': // Triple
            case '-': // Triple
                if (currentValue === 25) {
                    // Don't allow Triple bull
                    return;
                }
                currentMultiplier = 3;
                break;
            case '+': // Cycle through multipliers
                if (currentValue === 0) {
                    return;
                }
                currentMultiplier++;
                if (currentValue === 25) {
                    currentMultiplier = currentMultiplier > 2 ? 1 : currentMultiplier;
                } else {
                    currentMultiplier = currentMultiplier > 3 ? 1 : currentMultiplier;
                }
                break;
            case '1': text += '1'; break;
            case '2': text += '2'; break;
            case '3': text += '3'; break;
            case '4': text += '4'; break;
            case '5': text += '5'; break;
            case '6': text += '6'; break;
            case '7': text += '7'; break;
            case '8': text += '8'; break;
            case '9': text += '9'; break;
            case '0': text += '0'; break;
            default: /* Return */; return;
        }
        component.setDart(text, currentMultiplier);
    },
    findActive(components) {
        return _.filter(components, function (component) {
            if (component.state.isCurrentPlayer) {
                return component;
            }
        })[0];
    }
};
