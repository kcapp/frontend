const types = require("./match_types");
const shanghai = require("./shanghai");

exports.removeLast = function(dart, external) {
    const target = types.TARGET_JDC_PRACTICE[this.state.leg.round];
    if (target.constructor === Array) {
        if (dart.getScore() === target[this.state.currentDart - 1].value && dart.getMultiplier() === 2) {
            this.state.player.current_score -= dart.getValue() + 50;
            this.emit('score-change', this.state.player.current_score, this.state.player.player_id);
        }
    } else {
        if (dart.getScore() === target.value && target.multipliers.includes(dart.getMultiplier())) {
            if (this.state.currentDart === 3 && shanghai.isShanghai(this.getPayload(), target.value)) {
                // Remove bonus points
                this.state.player.current_score -= 100;
            }
            this.state.player.current_score -= dart.getValue();
            this.emit('score-change', this.state.player.current_score, this.state.player.player_id);
        }
    }
    if (!external) {
        this.emit('possible-throw', false, false, this.state.currentDart, -dart.getScore(), dart.getMultiplier(), true, false);
    }
    this.setState("jdcDart", this.state.currentDart - 1);
}

exports.isCheckout = (leg, currentDart) => {
    let visits = leg.visits.length;
    if (currentDart > 3) {
        visits++;
    }
    return visits > 0 && (visits % (19 * leg.players.length) === 0);
}

exports.confirmThrow = function (external) {
    let submitting = false;

    const dart = this.getCurrentDart();
    if (dart.getValue() === 0) {
        this.setDart(0, 1);
    }
    this.state.currentDart++;
    this.state.isSubmitted = true;

    const target = types.TARGET_JDC_PRACTICE[this.state.leg.round];
    if (target.constructor === Array) {
        // Doubles
        if (dart.getScore() === target[this.state.currentDart - 2].value && dart.getMultiplier() === 2) {
            // 50 Bonus points for hitting a double
            this.state.player.current_score += dart.getValue() + 50;
            this.emit('score-change', this.state.player.current_score, this.state.player.player_id);
        }
    } else {
        // Shanghai
        if (dart.getScore() === target.value && target.multipliers.includes(dart.getMultiplier())) {
            if (this.state.currentDart > 3 && shanghai.isShanghai(this.getPayload(), target.value)) {
                // 100 Bonus points for hitting a Shanghai
                this.state.player.current_score += 100;
            }

            this.state.player.current_score += dart.getValue();
            this.emit('score-change', this.state.player.current_score, this.state.player.player_id);
        }
    }

    const isCheckout = module.exports.isCheckout(this.state.leg, this.state.currentDart);
    if (isCheckout) {
        submitting = true;
    }
    if (!external) {
        // If an external event triggered the update don't emit a throw
        this.emit('possible-throw', isCheckout, false, this.state.currentDart - 1, dart.getScore(), dart.getMultiplier(), false, false);
    }
    this.setState("jdcDart", this.state.currentDart - 1);
    return submitting;
}
