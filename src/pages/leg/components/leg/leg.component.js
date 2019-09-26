var _ = require("underscore");
var moment = require('moment');
var io = require('../../../../util/socket.io-helper.js');
var alertify = require("../../../../util/alertify");

module.exports = {
    onCreate(input) {
        var roundNumber = Math.floor(input.leg.visits.length / input.leg.players.length) + 1;
        var matchName = input.match.match_mode.short_name;
        var venue = input.match.venue;

        this.state = {
            legId: input.leg.id,
            leg: input.leg,
            roundNumber: roundNumber,
            matchName: matchName,
            venueConfig: venue ? venue.config ? venue.config : {} : {},
            submitting: false,
            globalStatistics: input.global_statistics,
            socket: {},
            audioAnnouncer: undefined,
            legNum: input.match.legs.length + (["st", "nd", "rd"][((input.match.legs.length + 90) % 100 - 10) % 10 - 1] || "th")
        }
    },

    onMount() {
        document.addEventListener("keydown", this.onKeyDown.bind(this), false);
        document.addEventListener("keypress", this.onKeyPress.bind(this), false);

        // Setup socket endpoints
        var socket = io.connect(window.location.origin + '/legs/' + this.state.legId);
        socket.on('score_update', this.onScoreUpdate.bind(this));
        socket.on('possible_throw', this.onPossibleThrowEvent.bind(this));
        socket.on('say', this.onSay.bind(this));
        socket.on('announce', io.onAnnounce.bind(this));
        socket.on('leg_finished', (data) => {
            setTimeout(() => {
                // Wait until moving forward so we get leg finished announcement
                var match = data.match;
                if (match.is_finished) {
                    location.href = `${window.location.origin}/matches/${match.id}/result`;
                } else {
                    location.href = `${window.location.origin}/matches/${match.id}`;
                }
            }, 2000);
        });
        this.state.socket = socket;
        this.state.audioAnnouncer = new Audio();

        // If this is an official match, which has not had any darts thrown, and was not updated in the last two minutes
        // show the dialog to set player order
        var lastUpdated = (moment().valueOf() - moment.utc(this.input.leg.updated_at).valueOf()) / (1000 * 60);
        if (this.input.match.tournament_id && this.input.leg.visits.length === 0 && lastUpdated > 2) {
            document.getElementById('change-player-order').click();
        } else {
            if (this.input.leg.visits.length === 0) {
                var currentPlayer = this.input.players[this.input.leg.current_player_id];
                var name = currentPlayer.vocal_name ? currentPlayer.vocal_name : currentPlayer.first_name;
                setTimeout(() => {
                    socket.emit('speak', { text: this.state.legNum + " leg, " + name + " to throw first. Gameon!", type: 'leg_start' });
                }, 500);
            }
        }
    },

    onAnnounce(data) {
        io.announce(data, this);
    },

    onSay(data) {
        io.say(data, this);
    },

    onPossibleThrowEvent(data) {
        io.onPossibleThrow(data, this);
    },

    onScoreUpdate(data) {
        io.onScoreUpdate(data, this);
        var component = this.findActive(this.getComponents('players')).setLeg(this.state.leg);
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
        alertify.confirm('Delete last Visit', () => { this.state.socket.emit('undo_visit', {}); }, () => { this.state.submitting = false; });
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
            is_undo: isUndo,
            origin: 'web'
        });
    },

    onConfirmCheckout(actualThrown) {
        var component = this.findActive(this.getComponents('players'));
        var thrown = component.getDartsThrown() - 1;

        if (actualThrown < thrown ) {
            alertify.alert('Thrown cannot be less than actually thrown', () => { });
            return;
        }

        if (thrown === 3 || actualThrown == thrown) {
            // We don't need to do anything...
        } else if (thrown === 1) {
            var first = component.getDart(1);
            // Shift the final dart to correct position,
            component.getDart(actualThrown).setDart(first.getScore(), first.getMultiplier());
            // then add misses for remaining darts
            for (var i = 1; i < actualThrown; i++) {
                component.getDart(i).setDart(0, 1);
            }
        } else if (thrown == 2) {
            // Shift dart two to three,
            var second = component.getDart(2);
            component.getDart(3).setDart(second.getScore(), second.getMultiplier());
            // dart one to two,
            var first = component.getDart(1);
            component.getDart(2).setDart(first.getScore(), first.getMultiplier());
            // and add a miss
            component.getDart(1).setDart(0, 1);
        }
        document.getElementById('btn-dismiss-confirm-checkout').click();
        this.onLegFinished(true);
    },

    onLegFinished(finished, component) {
        if (finished) {
            var component = this.findActive(this.getComponents('players'));
            this.state.socket.emit('throw', JSON.stringify(component.getPayload()));
        } else {
            this.state.submitting = false;
        }
    },

    onKeyDown(e) {
        if (this.state.submitting) {
            // Don't allow input while score is being submitted
            return;
        }
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

