const _ = require("underscore");
const axios = require("axios");
const moment = require('moment');
const io = require('../../../../util/socket.io-helper.js');
const alertify = require('../../../../util/alertify.js');
const localStorage = require('../../../../util/localstorage.js');
const types = require('../../../../components/scorecard/components/match_types');
const { v4: uuidv4 } = require('uuid');

module.exports = {
    onCreate(input) {
        const venue = input.match.venue;

        let compactMode = false;
        let enableButtonInput = false
        if (input.buttons_only) {
            compactMode = true;
            enableButtonInput = true;
        }
        this.state = {
            uuid: uuidv4().split('-')[0],
            leg: input.leg,
            players: input.leg_players,
            roundNumber: input.leg.round,
            venueConfig: venue && venue.config ? venue.config : {},
            submitting: false,
            matchType: input.leg.leg_type.id || input.match.match_type.id,
            socket: {},
            audioAnnouncer: undefined,
            enableButtonInput: enableButtonInput,
            compactMode: compactMode,
            allButtonsMode: false,
            isPlayerBoardCam: input.leg_players.some(player => player.player.board_stream_url),
            announcedStart: false
        }
    },

    onMount() {
        console.log(this.input.locals);
        document.addEventListener("keydown",  _.debounce(function(e) {
            // Some Android tablets do a weird thing where they emit mulitple events, so debounce it here,
            // to ensure we only send a single one
            this.onKeyDown(e);
        }.bind(this), 10), false);

        this.state.socket = this.setupSio(this.state.leg.id);
        this.state.audioAnnouncer = new Audio();

        // If this is an official match, which has not had any darts thrown, and was not updated in the last two minutes
        // show the dialog to set player order
        const lastUpdated = (moment().valueOf() - moment.utc(this.input.leg.updated_at).valueOf()) / (1000 * 60);
        if (this.input.match.tournament_id && this.input.leg.visits.length === 0 && lastUpdated > 2) {
            document.getElementById('change-player-order').click();
        } else {
            if (this.input.leg.visits.length === 0) {
                const currentPlayer = this.input.players[this.input.leg.current_player_id];
                setTimeout(() => {
                    this.state.socket.emit('announce', { leg_num: this.input.match.current_leg_num, player: currentPlayer, type: 'match_start' });
                }, 900);
            }
        }
        // Disable gestures on mobile devices
        document.addEventListener('gesturestart', (e) => {
            e.preventDefault();
        });

        window.addEventListener('pageshow', (event) => {
            // If navigation happens via 'back; button make sure to reload to get correct state
            var perfEntries = performance.getEntriesByType("navigation");
            if (perfEntries[0].type === "back_forward") {
                location.reload();
            }
        });
    },

    setupSio(legId) {
        const socket = io.connect(`${window.location.origin}/legs/${legId}`);
        socket.on('score_update', this.onScoreUpdate.bind(this));
        socket.on('possible_throw', this.onPossibleThrowEvent.bind(this));
        socket.on('say', this.onSay.bind(this));
        socket.on('announce', io.onAnnounce.bind(this));
        socket.on('leg_finished', (data) => {
            let match = data.match;

            // Sometimes the say_finish event isn't sent (Browser isn't play audio, iOS, etc),
            // which prevents us from moving to the next leg, so create a global timeout here as well
            const sayWait = setTimeout(nextLeg.bind(this), 6000);
            socket.once('say_finish', () => {
                clearTimeout(sayWait);
                nextLeg.bind(this)();
            });

            function nextLeg() {
                const isController = localStorage.get('controller');
                if (match.is_finished) {
                    location.href = isController ? '/controller' : `${window.location.origin}/matches/${match.id}/result?finished=true`;
                } else {
                    axios.all([
                        axios.get(`${window.location.protocol}//${window.location.hostname}${this.input.locals.kcapp.api_path}/leg/${match.current_leg_id}`),
                        axios.get(`${window.location.protocol}//${window.location.hostname}${this.input.locals.kcapp.api_path}/leg/${match.current_leg_id}/players`)
                    ]).then(axios.spread((legData, playersData) => {
                        const leg = legData.data;
                        const players  = playersData.data;

                        this.state.leg = leg;
                        this.state.players = players;

                        this.state.socket.disconnect();
                        this.state.socket = this.setupSio(leg.id);

                        // Reset all player scorecards
                        const scorecards = this.getComponents('players');
                        scorecards.forEach(scorecard => scorecard.reset());

                        if (this.state.matchType == types.TIC_TAC_TOE) {
                            this.getComponent("tic-tac-toe-board").resetBoard(leg.parameters);
                        }
                        // MatchType might have changed, so make sure we update it
                        this.state.matchType = leg.leg_type.id || match.match_type.id;

                        const currentPlayer = this.input.players[leg.current_player_id];
                        this.state.announcedStart = false;
                        this.state.socket.emit('announce', { leg_num: match.current_leg_num, player: currentPlayer, type: 'match_start' });

                        // Update the URL of current page, so that if a refresh is triggered we go to the current leg, and not the finished one
                        window.history.pushState(`leg${leg.id}`, "", `/legs/${leg.id}`);
                    })).catch(error => {
                        alert(`Error when refreshing leg, please reload the page`);
                        console.log(JSON.stringify(error));
                    });
                }
            }
        });
        socket.on('error', this.onError.bind(this));
        return socket;
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
        window.kcapp.lastEvent = new Date();
        io.onPossibleThrow(data, this);
    },

    onScoreUpdate(data) {
        window.kcapp.lastEvent = new Date();
        if (data.match && data.match.is_finished) {
            /// Don't update UI when match is finished
            return;
        }
        io.onScoreUpdate(data, this);
        this.findActive(this.getComponents('players')).setLeg(this.state.leg);
    },

    onScoreChange(scored, playerId, component) {
        if (!playerId) {
            playerId = this.findActive(this.getComponents('players')).state.player.player_id;
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
        if (this.state.leg.visits.length > 0) {
            this.state.submitting = true;
            alertify.confirm('Delete last Visit',
            () => {
                this.state.socket.emit('undo_visit', {});
            },
            () => {
                this.state.submitting = false;
            });
        }
    },

    onScoreButtonPressed(score, multiplier, isUndo) {
        const component = this.findActive(this.getComponents('players'));

        const dartsThrown = component.getDartsThrown();
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
        let component = this.findActive(this.getComponents('players'));
        if (isCheckout) {
            component.confirmLegFinish();
        }
        if (this.state.matchType == types.TIC_TAC_TOE) {
            this.getComponent("tic-tac-toe-board").updateBoard(score, multiplier, isUndo);
        }

        this.state.socket.emit('possible_throw', {
            uuid: this.state.uuid,
            current_player_id: component.state.player.player_id,
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
            let component = this.findActive(this.getComponents('players'));
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

        const component = this.findActive(this.getComponents('players'));
        if (e.key === 'Backspace') {
            component.removeLast();
            e.preventDefault();
        } else if (types.SUPPORT_SIMPLE_INPUT.includes(this.state.matchType) && simplified.includes(e.keyCode)) {
            let value = 0;

            let multiplier;
            if (this.state.matchType === types.DARTS_AT_X) {
                value = this.state.leg.starting_score
            } else if (this.state.matchType === types.AROUND_THE_CLOCK) {
                value = component.state.player.current_score + 1;
                value = value === 21 ? 25 : value;
                if (e.keyCode !== KEY_END) {
                    value = 0;
                }
                multiplier = 1;
            } else if (this.state.matchType === types.AROUND_THE_WORLD || this.state.matchType === types.SHANGHAI) {
                value = this.state.leg.round === 21 ? 25 : this.state.leg.round;
            } else if (this.state.matchType === types.BERMUDA_TRIANGLE) {
                const target = types.TARGET_BERMUDA_TRIANGLE[this.state.leg.round];
                if (target.value !== -1) {
                    value = target.value;
                }
            } else if (this.state.matchType === types.FOUR_TWENTY) {
                value = types.TARGET_FOUR_TWENTY[this.state.leg.round].value;
                if (e.keyCode !== KEY_ARROW_DOWN) {
                    value = 0;
                    multiplier = 1;
                }
            } else if (this.state.matchType === types.KILL_BULL) {
                value = 25;
            } else if (this.state.matchType === types.JDC_PRACTICE) {
                const target = types.TARGET_JDC_PRACTICE[this.state.leg.round];
                if (target.constructor === Array) {
                    const currentDart = component.state.currentDart;
                    const doubleTarget = target[currentDart - 1];
                    value = doubleTarget.value;
                } else {
                    value = target.value;
                }
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
            let dartsThrown = component.getDartsThrown();
            if (dartsThrown > 2) {
                this.state.submitting = true;
                this.state.socket.emit('throw', JSON.stringify(component.getPayload()));
            } else {
                this.state.submitting = component.confirmThrow(false);
            }

            e.preventDefault();
        } else if (e.key === 'Tab') {
            e.preventDefault();
            this.onSwapPlayers();
        } else if (e.key === 'F3') {
            e.preventDefault();

            // Throw same dart as last
            if (component.state.currentDart === 0) {
                // Cannot redo previous dart when no darts are thrown
                return;
            }
            let dart = component.getDart(component.state.currentDart - 1);

            let value = dart.state.value;
            let multiplier = dart.state.multiplier;
            component.setDart(value, multiplier);
            let dartsThrown = component.getDartsThrown();
            if (dartsThrown > 2) {
                this.state.submitting = true;
                this.state.socket.emit('throw', JSON.stringify(component.getPayload()));
            } else {
                this.state.submitting = component.confirmThrow(false);
            }
        } else if (e.key === 'F2') {
            e.preventDefault();

            if (this.state.matchType !== types.X01) {
                // Only support checkout for X01
                return;
            }
            let currentScore = component.state.player.current_score;
            if (currentScore > 40 && currentScore !== 50) {
                // Score is too high
                return;
            }
            let isCheckoutPossible = currentScore % 2 === 0;
            if (!isCheckoutPossible) {
                // We don't have a even number, so can't checkout
                return;
            }

            let value = currentScore / 2;
            let multiplier = 2;

            component.setDart(value, multiplier);
            let dartsThrown = component.getDartsThrown();
            if (dartsThrown > 2) {
                this.state.submitting = true;
                this.state.socket.emit('throw', JSON.stringify(component.getPayload()));
            } else {
                this.state.submitting = component.confirmThrow(false);
            }
        }
        // Forward to normal key handler
        this.onKeyPress(e);
    },

    onKeyPress(e) {
        if (this.state.submitting) {
            // Don't allow input while score is being submitted
            return;
        }
        const component = this.findActive(this.getComponents('players'));
        if (component.state.player.player.is_bot) {
            // Don't allow adding darts for bot
            return;
        }

        let text = '';
        const currentValue = component.getCurrentValue();
        let currentMultiplier = component.getCurrentMultiplier();
        switch (e.key) {
            case 'Enter':
                const dartsThrown = component.getDartsThrown();
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
        if ((currentValue + text) === "25" && currentMultiplier === 3) {
            // Don't allow triple bull
            currentMultiplier = 2;
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
        const venue = localStorage.get('venue_id');
        this.state.socket.emit('warmup_started', { leg: this.input.leg, match: this.input.match, venue: venue ? parseInt(venue) : null });
    },

    onSmartboardReconnect() {
        this.state.socket.emit('reconnect_smartboard', { leg: this.input.leg, match: this.input.match });
    },

    onSwapPlayers() {
        const component = this.findActive(this.getComponents('players'));
        if (this.state.leg.visits.length > 0 || component.state.currentDart !== 1) {
            // Don't allow switching players when match has started
            return;
        }

        if (this.state.players.length > 2) {
            // If more than two players just show the change-order modal
            document.getElementById('change-player-order').click();
            return;
        }
        const order = {};
        const players = this.state.players.reverse();
        for (let i = 0; i < players.length; i++) {
            order[players[i].player_id] = i + 1;
        }
        axios.put(`${window.location.origin}/legs/${this.state.leg.id}/order`, order)
            .then(response => {
                const leg = response.data.leg;
                this.state.leg = leg;
                const players = response.data.players;
                this.state.players = players;
            }).catch(error => {
                alert('Error changing player order. Please reload');
                location.reload();
            });
    },

    onToggleCamera(enabled) {
        this.state.isPlayerBoardCam = enabled;
    },
};
