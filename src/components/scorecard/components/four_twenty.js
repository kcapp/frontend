var types = require("./match_types");

exports.removeLast = function(dart, external) {
    var target = types.TARGET_FOUR_TWENTY[this.state.leg.round];
    if ((dart.getScore() === target.value || target.value === -1) && target.multipliers.includes(dart.getMultiplier())) {
        this.state.player.current_score += dart.getValue();
        this.emit('score-change', this.state.player.current_score, this.state.player.player_id);
    }
    if (!external) {
        this.emit('possible-throw', false, false, this.state.currentDart, -dart.getScore(), dart.getMultiplier(), true, false);
    }
}

exports.isCheckout = (leg, currentDart) => {
    var visits = leg.visits.length;
    if (currentDart > 3) {
        visits++;
    }
    return visits > 0 && ((visits * 3) % (60 * leg.players.length) === 0);
}

exports.confirmThrow = function (external) {
    var submitting = false;

    var dart = this.getCurrentDart();
    if (dart.getValue() === 0) {
        this.setDart(0, 1);
    }
    this.state.currentDart++;
    this.state.isSubmitted = true;

    var target = types.TARGET_FOUR_TWENTY[this.state.leg.round];
    if (dart.getScore() === target.value && target.multipliers.includes(dart.getMultiplier())) {
        this.state.player.current_score -= target.score ? target.score : dart.getValue();
        this.emit('score-change', this.state.player.current_score, this.state.player.player_id);
    }

    var isCheckout = module.exports.isCheckout(this.state.leg, this.state.currentDart);
    if (isCheckout) {
        submitting = true;
    }
    if (!external) {
        // If an external event triggered the update don't emit a throw
        this.emit('possible-throw', isCheckout, false, this.state.currentDart - 1, dart.getScore(), dart.getMultiplier(), false, false);
    }
    return submitting;
}
