const alertify = require("../../util/alertify");

const x01 = require("./components/x01");
const shootout = require("./components/shootout");
const cricket = require("./components/cricket");
const dartsAtX = require("./components/darts_at_x");
const aroundTheWorld = require("./components/around_the_world");
const shanghai = require("./components/shanghai");
const aroundTheClock = require("./components/around_the_clock");
const ticTacToe = require('./components/tic_tac_toe');
const bermudaTriangle = require('./components/bermuda_triangle');
const fourTwenty = require('./components/four_twenty');
const killBull = require('./components/kill_bull');
const gotcha = require('./components/gotcha');
const jdcPractice = require('./components/jdc_practice');
const knockout = require("./components/knockout");
const scam = require("./components/scam");

const types = require("./components/match_types");

const DART_CONTAINER_MAP = { 1: 'first', 2: 'second', 3: 'third' };

module.exports = {
    onCreate(input) {
        const player = input.player;
        this.state = {
            uuid: input.uuid,
            leg: input.leg,
            player: player,
            type: input.leg.leg_type.id,
            isCurrentPlayer: player.is_current_player,
            submitClass: null,
            totalScore: 0,
            currentDart: 1,
            isSubmitted: true,
            isBusted: false,
            isBot: player.player.is_bot,
            isSpectate: input.spectate
        }
    },

    onInput(input) {
        if (input.submitting && this.state.isCurrentPlayer) {
            this.state.submitClass = "submitting";
        } else {
            this.state.submitClass = null;
        }
        this.state.isCurrentPlayer = input.player.is_current_player;
        this.state.player = input.player;
        this.state.leg = input.leg;
        this.state.type = input.leg.leg_type.id;
    },

    reset() {
        this.state.totalScore = 0;
        this.state.currentDart = 1;
        this.state.isSubmitted = true;
        this.state.isBusted = false;

        // Reset all the darts to their initial state
        this.getComponent(DART_CONTAINER_MAP[1]).reset();
        this.getComponent(DART_CONTAINER_MAP[2]).reset();
        this.getComponent(DART_CONTAINER_MAP[3]).reset();

        switch (this.state.type) {
            case types.TIC_TAC_TOE:
                ticTacToe.reset.bind(this)();
                break;
        }
    },

    setLeg(leg) {
        this.state.leg = leg;
    },

    getDart(idx) {
        return this.getComponent(DART_CONTAINER_MAP[idx]);
    },

    getCurrentDart() {
        return this.getComponent(DART_CONTAINER_MAP[this.state.currentDart]);
    },

    getCurrentValue() {
        var dart = this.getCurrentDart();
        return dart ? dart.state.value : 0;
    },

    getCurrentMultiplier() {
        var dart = this.getCurrentDart()
        return dart ? dart.state.multiplier : 1;
    },

    getDartsThrown() {
        return this.state.currentDart;
    },

    removeLast(external) {
        if (this.state.currentDart <= 1 && this.state.isSubmitted) {
            this.emit('undo-throw');
            return;
        }
        if (this.state.isSubmitted) {
            this.state.currentDart--;
            const dart = this.getCurrentDart();

            switch (this.state.type) {
                case types.SHOOTOUT:
                    shootout.removeLast.bind(this)(dart, external);
                    break;
                case types.X01HANDICAP:
                case types.X01:
                    x01.removeLast.bind(this)(dart, external);
                    break;
                case types.CRICKET:
                    cricket.removeLast.bind(this)(dart, external);
                    break;
                case types.DARTS_AT_X:
                    dartsAtX.removeLast.bind(this)(dart, external);
                    break;
                case types.AROUND_THE_WORLD:
                    aroundTheWorld.removeLast.bind(this)(dart, external);
                    break;
                case types.SHANGHAI:
                    shanghai.removeLast.bind(this)(dart, external);
                    break;
                case types.AROUND_THE_CLOCK:
                    aroundTheClock.removeLast.bind(this)(dart, external);
                    break;
                case types.TIC_TAC_TOE:
                    ticTacToe.removeLast.bind(this)(dart, external);
                    break;
                case types.BERMUDA_TRIANGLE:
                    bermudaTriangle.removeLast.bind(this)(dart, external);
                    break;
                case types.FOUR_TWENTY:
                    fourTwenty.removeLast.bind(this)(dart, external);
                    break;
                case types.KILL_BULL:
                    killBull.removeLast.bind(this)(dart, external);
                    break;
                case types.GOTCHA:
                    gotcha.removeLast.bind(this)(dart, external);
                    break;
                case types.JDC_PRACTICE:
                    jdcPractice.removeLast.bind(this)(dart, external);
                    break;
                case types.KNOCKOUT:
                    knockout.removeLast.bind(this)(dart, external);
                    break;
                case types.SCAM:
                    scam.removeLast.bind(this)(dart, external);
                    break;
            }
            dart.reset();
        } else {
            const dart = this.getCurrentDart();
            dart.reset();
        }
        this.state.isSubmitted = true;
    },

    confirmThrow(external) {
        var submitting = false;
        if (this.state.currentDart <= 3 && !this.state.isBusted) {
            switch (this.state.type) {
                case types.SHOOTOUT:
                    submitting = shootout.confirmThrow.bind(this)(external);
                    break;
                case types.X01HANDICAP:
                case types.X01:
                    submitting = x01.confirmThrow.bind(this)(external);
                    break;
                case types.CRICKET:
                    submitting = cricket.confirmThrow.bind(this)(external);
                    break;
                case types.DARTS_AT_X:
                    submitting = dartsAtX.confirmThrow.bind(this)(external);
                    break;
                case types.AROUND_THE_WORLD:
                    submitting = aroundTheWorld.confirmThrow.bind(this)(external);
                    break;
                case types.SHANGHAI:
                    submitting = shanghai.confirmThrow.bind(this)(external);
                    break;
                case types.AROUND_THE_CLOCK:
                    submitting = aroundTheClock.confirmThrow.bind(this)(external);
                    break;
                case types.TIC_TAC_TOE:
                    submitting = ticTacToe.confirmThrow.bind(this)(external);
                    break;
                case types.BERMUDA_TRIANGLE:
                    submitting = bermudaTriangle.confirmThrow.bind(this)(external);
                    break;
                case types.FOUR_TWENTY:
                    submitting = fourTwenty.confirmThrow.bind(this)(external);
                    break;
                case types.KILL_BULL:
                    submitting = killBull.confirmThrow.bind(this)(external);
                    break;
                case types.GOTCHA:
                    submitting = gotcha.confirmThrow.bind(this)(external);
                    break;
                case types.JDC_PRACTICE:
                    submitting = jdcPractice.confirmThrow.bind(this)(external);
                    break;
                case types.KNOCKOUT:
                    submitting = knockout.confirmThrow.bind(this)(external);
                    break;
                case types.SCAM:
                    submitting = scam.confirmThrow.bind(this)(external);
                    break;
            }
        }
        return submitting;
    },

    setDart(value, multiplier, idx) {
        var dart;
        if (idx) {
            dart = this.getDart(idx);
        } else {
            dart = this.getCurrentDart();
        }
        var newValue = parseInt(`${dart.state.value}${value}`);
        if (newValue > 20 && newValue !== 25) {
            if (this.state.spectate) {
                // Don't show alerts for spectators
                return;
            }
            alertify.notify(`Invalid Value: ${newValue}`, 'warning');
            return;
        }
        dart.setDart(newValue, multiplier);
        this.state.isSubmitted = false;
    },

    getPayload() {
        const first = this.getComponent(DART_CONTAINER_MAP[1]);
        const second = this.getComponent(DART_CONTAINER_MAP[2]);
        const third = this.getComponent(DART_CONTAINER_MAP[3]);
        return {
            player_id: this.state.player.player_id,
            leg_id: this.state.leg.id,
            first_dart: first.toJSON(),
            second_dart: second.toJSON(),
            third_dart: third.toJSON()
        };
    },

    confirmLegFinish() {
        alertify.confirm('Leg will be finished.',
            () => {
                this.emit('leg-finished', true);
            }, () => {
                this.removeLast();
                this.emit('leg-finished', false);
            });
    }
};
