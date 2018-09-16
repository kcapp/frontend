const alertify = require("../../util/alertify");

const CLASS_DART_SINGLE = 'dart-score-single';
const CLASS_DART_DOUBLE = 'dart-score-double';
const CLASS_DART_TRIPLE = 'dart-score-triple';

const DART_CONTAINER_MAP = { 1: 'first', 2: 'second', 3: 'third' };

module.exports = {
    onCreate(input) {
        var player = input.player;
        this.state = {
            legId: input.legId,
            player: player,
            playerId: player.player_id,
            isCurrentPlayer: player.is_current_player,
            totalScore: 0,
            currentDart: 1,
            isSubmitted: true,
            isBusted: false
        }
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
    removeLast() {
        if (this.state.currentDart <= 1 && this.state.isSubmitted) {
            return;
        }
        if (this.state.isSubmitted) {
            this.state.currentDart--;
            var dart = this.getCurrentDart();
            var value = dart.getValue();

            this.state.totalScore -= value;
            this.state.player.current_score += value;
            this.emit('score-change', -value);
            this.emit('possible-throw', false, false, this.state.currentDart, -dart.getScore(), dart.getMultiplier(), true);
            dart.reset();
        } else {
            var dart = this.getCurrentDart()
            dart.reset();
        }
        this.state.isSubmitted = true;
    },
    confirmThrow() {
        var submitting = false;
        if (this.state.currentDart <= 3 && !this.state.isBusted) {
            var dart = this.getCurrentDart();
            var scored = dart.getValue();
            if (scored === 0) {
                this.setDart(0, 1);
            }
            this.state.totalScore += scored;
            this.state.currentDart++;
            this.state.isSubmitted = true;

            this.emit('score-change', scored);
            var isCheckout = this.isCheckout(this.state.player.current_score, dart);
            var isBust = this.isBust(this.state.player.current_score, scored);
            if (isCheckout) {
                submitting = true;
                alertify.confirm('Leg will be finished.',
                    () => {
                        this.emit('leg-finished', true);
                    }, () => {
                        this.removeLast();
                        this.emit('leg-finished', false);
                    });
            } else if (isBust) {
                submitting = true;
                this.state.isBusted = true;
                alertify.confirm('Player busted',
                    () => {
                        alertify.success('Player busted');
                        this.emit('player-busted', true);
                    },
                    () => {
                        this.removeLast();
                        this.state.isBusted = false;
                        this.emit('player-busted', false);
                    });
            }
            this.state.player.current_score -= scored;
            this.emit('possible-throw', isCheckout, isBust, this.state.currentDart - 1, dart.getScore(), dart.getMultiplier(), false);
        }
        return submitting;
    },
    isBust(currentScore, thrown) {
        if (currentScore - thrown < 2) {
            return true;
        }
        return false;
    },
    isCheckout(currentScore, dart) {
        if (currentScore - dart.getValue() === 0 && dart.getMultiplier() === 2) {
            return true;
        }
        return false;
    },
    setDart(value, multiplier, idx) {
        var dart;
        if (idx) {
            dart = this.getDart(idx);
        } else {
            dart = this.getCurrentDart();
        }
        var newValue = parseInt(dart.state.value + '' + value);
        if (newValue > 20 && newValue !== 25) {
            alertify.alert('Invalid Value', () => { });
            return;
        }
        dart.setDart(newValue, multiplier);
        this.state.isSubmitted = false;
    },
    getPayload() {
        var first = this.getComponent(DART_CONTAINER_MAP[1]);
        var second = this.getComponent(DART_CONTAINER_MAP[2]);
        var third = this.getComponent(DART_CONTAINER_MAP[3]);
        return {
            player_id: this.state.playerId,
            leg_id: this.state.legId,
            first_dart: first.toJSON(),
            second_dart: second.toJSON(),
            third_dart: third.toJSON()
        };
    }
};
