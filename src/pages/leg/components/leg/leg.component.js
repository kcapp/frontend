var _ = require("underscore");
var moment = require('moment');
var io = require('../../../../util/socket.io-helper.js');
var alertify = require("../../../../util/alertify");
var types = require('../../../../components/scorecard/components/match_types');
var { v4: uuidv4 } = require('uuid');

module.exports = {
    onCreate(input) {
        var venue = input.match.venue;

        this.state = {
            uuid: uuidv4().split('-')[0],
            leg: input.leg,
            players: input.leg_players,
            roundNumber: input.leg.round,
            venueConfig: venue && venue.config ? venue.config : {},
            submitting: false,
            globalStatistics: input.global_statistics,
            type: input.match.match_type.id,
            socket: {},
            audioAnnouncer: undefined,
            enableButtonInput: false,
            compactMode: false,
            allButtonsMode: false,
            isPlayerBoardCam: input.leg_players.some(player => player.player.board_stream_url),
            announcedStart: false

        }
    },

    onMount() {
        document.addEventListener("keydown", this.onKeyDown.bind(this), false);
        document.addEventListener("keypress", this.onKeyPress.bind(this), false);

        // Setup socket endpoints
        const socket = io.connect(`${window.location.origin}/legs/${this.state.leg.id}`);
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
                    location.href = `${window.location.origin}/legs/${match.current_leg_id}`;
                }
            }, 5000);
        });
        socket.on('error', this.onError.bind(this));
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
                    socket.emit('speak', { text: `${this.input.match.current_leg_num} leg, ${name} to throw first. Game on!`, type: 'leg_start' });
                }, 900);
            }
        }
        // Disable gestures on mobile devices
        document.addEventListener('gesturestart', (e) => {
            e.preventDefault();
        });
    },

    onAnnounce(data) {
        io.announce(data, this);
    },

    onSay(data) {
        if (data.type === 'leg_start' && this.state.announcedStart) {
            return;
        } else if (data.type === 'leg_start') {
            this.state.announcedStart = true;
        }
        io.say(data, this);
    },

    onPossibleThrowEvent(data) {
        io.onPossibleThrow(data, this);
    },

    onScoreUpdate(data) {
        if (data.match && data.match.is_finished) {
            /// Don't update UI when match is finished
            return;
        }
        io.onScoreUpdate(data, this);
        this.findActive(this.getComponents('players')).setLeg(this.state.leg);
    },

    onScoreChange(scored, playerId, component) {
        if (!playerId) {
            playerId = this.findActive(this.getComponents('players')).state.playerId;
        }
        this.getComponent(`player-${playerId}`).setScored(scored);
    },

    onError(error) {
        alertify.alert(`Error: ${error.message}. Refresh and try again`, () => {
            this.state.submitting = false;
        });
    },

    onEnableButtonInput(enabled) {
        this.state.enableButtonInput = enabled;
        if (!enabled) {
            this.state.compactMode = false;
        }
    },

    onEnableCompactMode(enabled) {
        this.state.compactMode = enabled;
    },

    onEnableAllButtonsMode(enabled) {
        this.state.allButtonsMode = enabled;
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
        alertify.confirm('Delete last Visit',
        () => {
            this.state.socket.emit('undo_visit', {});
        },
        () => {
            this.state.submitting = false;
        });
    },

    onScoreButtonPressed(score, multiplier, isUndo) {
        var component = this.findActive(this.getComponents('players'));

        var dartsThrown = component.getDartsThrown();
        if (isUndo) {
            component.removeLast();
        } else {
            component.setDart(score, multiplier, dartsThrown);
            this.state.submitting = component.confirmThrow(false);

            if (dartsThrown >= 3 && !this.state.submitting) {
                this.state.submitting = true;
                this.state.socket.emit('throw', JSON.stringify(component.getPayload()));
            }
        }
    },

    onPossibleThrow(isCheckout, isBust, dartsThrown, score, multiplier, isUndo, submit) {
        var component = this.findActive(this.getComponents('players'));
        if (isCheckout) {
            component.confirmLegFinish();
        }
        if (this.input.match.match_type.id == types.TIC_TAC_TOE) {
            this.getComponent("tic-tac-toe-board").updateBoard(score, multiplier, isUndo);
        }

        this.state.socket.emit('possible_throw', {
            uuid: this.state.uuid,
            current_player_id: component.state.playerId,
            score: score,
            multiplier: multiplier,
            is_bust: isBust,
            is_finished: isCheckout,
            darts_thrown: dartsThrown,
            is_undo: isUndo,
            origin: "web"
        });
        if (submit) {
            this.state.submitting = true;
            this.state.socket.emit('throw', JSON.stringify(component.getPayload()));
        }
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
        const KEY_END = 35;
        const KEY_ARROW_DOWN = 40;
        const KEY_PAGE_DOWN = 34;
        const KEY_INSERT = 45;
        const KEY_DELETE = 46;
        const simplified = [ KEY_END, KEY_ARROW_DOWN, KEY_PAGE_DOWN, KEY_INSERT, KEY_DELETE ];

        var component = this.findActive(this.getComponents('players'));
        if (e.key === 'Backspace') {
            component.removeLast();
            e.preventDefault();
        } else if (types.SUPPORT_SIMPLE_INPUT.includes(this.input.match.match_type.id) && simplified.includes(e.keyCode)) {
            var value = 0;

            var multiplier;
            if (this.input.match.match_type.id === types.DARTS_AT_X) {
                value = this.state.leg.starting_score
            } else if (this.input.match.match_type.id === types.AROUND_THE_CLOCK) {
                value = component.state.player.current_score + 1;
                value = value === 21 ? 25 : value;
                if (e.keyCode !== KEY_END) {
                    value = 0;
                }
                multiplier = 1;
            } else if (this.input.match.match_type.id === types.AROUND_THE_WORLD || this.input.match.match_type.id === types.SHANGHAI) {
                value = this.state.leg.round === 21 ? 25 : this.state.leg.round;
            } else if (this.input.match.match_type.id === types.BERMUDA_TRIANGLE) {
                var target = types.TARGET_BERMUDA_TRIANGLE[this.state.leg.round];
                if (target.value !== -1) {
                    value = target.value;
                }
            } else if (this.input.match.match_type.id === types.FOUR_TWENTY) {
                value = types.TARGET_FOUR_TWENTY[this.state.leg.round].value;
                if (e.keyCode !== KEY_ARROW_DOWN) {
                    value = 0;
                    multiplier = 1;
                }
            } else if (this.input.match.match_type.id === types.KILL_BULL) {
                value = 25;
            }
            if (!multiplier) {
                multiplier = 1;
                if (e.keyCode === KEY_PAGE_DOWN && value !== 25) {
                    multiplier = 3;
                } else if (e.keyCode === KEY_ARROW_DOWN) {
                    multiplier = 2;
                }
            }

            if (e.keyCode === KEY_INSERT || e.keyCode === KEY_DELETE) {
                value = 0;
            }
            component.setDart(value, multiplier);
            var dartsThrown = component.getDartsThrown();
            if (dartsThrown > 2) {
                this.state.submitting = true;
                this.state.socket.emit('throw', JSON.stringify(component.getPayload()));
            } else {
                this.state.submitting = component.confirmThrow(false);
            }

            e.preventDefault();
        }
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
                    this.state.submitting = component.confirmThrow(false);
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
            default: /* Return */ return;
        }
        component.setDart(text, currentMultiplier);
    },

    findActive(components) {
        return _.filter(components, (component) => {
            if (component.state.isCurrentPlayer) {
                return component;
            }
            return null;
        })[0];
    },

    onWarmupStarted() {
        this.state.socket.emit('warmup_started', { leg: this.input.leg, match: this.input.match });
    },

    onSmartboardReconnect() {
        this.state.socket.emit('reconnect_smartboard', { leg: this.input.leg, match: this.input.match });
    }
};

