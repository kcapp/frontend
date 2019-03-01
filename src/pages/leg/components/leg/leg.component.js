const _ = require("underscore");
const io = require('../../../../util/socket.io-helper.js');
const axios = require('axios');
const alertify = require("../../../../util/alertify");

module.exports = {
    onCreate(input) {
        var roundNumber = Math.floor(input.leg.visits.length / input.leg.players.length) + 1;
        var matchName = input.match.match_mode.short_name;
        this.state = {
            legId: input.leg.id,
            roundNumber: roundNumber,
            matchName: matchName,
            submitting: false,
            socket: {}
        }
    },

    onMount() {
        document.write('<script type="text/javascript" src="/javascripts/responsivevoice.1.5.8..js"><\/script>');

        document.addEventListener("keydown", this.onKeyDown.bind(this), false);
        document.addEventListener("keypress", this.onKeyPress.bind(this), false);

        // Setup socket endpoints
        var socket = io.connect(window.location.origin + '/legs/' + this.state.legId);
        socket.on('score_update', this.onScoreUpdate.bind(this));
        socket.on('say', io.say);
        this.state.socket = socket;
    },

    onScoreUpdate(data) {
        io.onScoreUpdate(data, this);
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

    onUndoThrow() {
        this.state.submitting = true;
        alertify.confirm('Delete last Visit', () => { this.state.socket.emit('undo_visit', { }); }, () => { this.state.submitting = false; });
    },

    onPossibleThrow(isCheckout, isBust, dartsThrown, score, multiplier, isUndo) {
        var component = this.findActive(this.getComponents('players'));
        this.state.socket.emit('possible_throw', {
            current_player_id: component.state.playerId,
            score: score,
            multiplier: multiplier,
            is_bust: isBust,
            is_finished: isCheckout,
            darts_thrown: dartsThrown,
            is_undo: isUndo
        });
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
    },

    onWarmupStarted() {
        this.state.socket.emit('warmup_started', { leg: this.input.leg, match: this.input.match });
    }
};
