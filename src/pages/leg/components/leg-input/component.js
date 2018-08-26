const _ = require("underscore");
const axios = require('axios');
const io = require('socket.io-client');

module.exports = {
    onCreate(input) {
        const socket = io('http://localhost:3000/legs/6483');

        var roundNumber = Math.floor(input.leg.visits.length / input.leg.players.length) + 1;
        var matchName = input.match.match_mode.short_name;
        this.state = {
            socket: socket,
            legId: input.leg.id,
            roundNumber: roundNumber,
            matchName: matchName
        }

        socket.on('connect', (data) => {
            socket.emit('join', 'Client Connecting');
        });

        socket.on('error', (data) => {
            console.log(data);
        });

        socket.on('score_update', this.onScoreUpdate.bind(this));
    },
    onScoreUpdate(data) {
        var leg = data.leg;
        // Update round number
        this.state.roundNumber = Math.floor(leg.visits.length / leg.players.length) + 1;

        // Set updated score per player
        var players = data.players;
        for (var i = 0; i < players.length; i++) {
            var player = players[i];
            var component = this.getComponent('player-' + player.player_id);
            component.state.currentScore = player.current_score;
            component.state.isCurrentPlayer = player.player_id === leg.current_player_id;
        }
    },

    onMount() {
        document.addEventListener("keydown", this.onKeyDown.bind(this), false);
        document.addEventListener("keypress", this.onKeyPress.bind(this), false);
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
        var component = this.findActive(this.getComponents('players'));

        var text = '';
        var currentValue = component.getCurrentValue();
        var currentMultiplier = component.getCurrentMultiplier();
        switch (e.key) {
            case 'Enter':
                var dartsThrown = component.getDartsThrown();
                if (dartsThrown > 3) {
                    var data = component.getDarts();
                    data.leg_id = this.state.legId;
                    this.state.socket.emit('throw', JSON.stringify(data));
                } else {
                    component.confirmThrow();
                }
                return;
            case '/': // Single
                currentMultiplier = 1;
                break;
            case '*': // Double
                currentMultiplier = 2;
                break;
            case ',': // Triple
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
