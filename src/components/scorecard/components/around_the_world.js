exports.removeLast = function(dart) {
    if (dart.getScore() === this.state.leg.round || (dart.getScore() === 25 && this.state.leg.round === 21)) {
        this.state.player.current_score -= dart.getValue();
        this.emit('score-change', this.state.player.current_score, this.state.player.player_id);
    }
    this.emit('possible-throw', false, false, this.state.currentDart, -dart.getScore(), dart.getMultiplier(), true);
}

exports.isCheckout = (leg, currentDart) => {
    var visits = leg.visits.length;
    if (currentDart > 3) {
        visits++;
    }
    return visits > 0 && (visits % (21 * leg.players.length) === 0);
}

exports.confirmThrow = function (external) {
    var submitting = false;

    var dart = this.getCurrentDart();
    if (dart.getValue() === 0) {
        this.setDart(0, 1);
    }
    this.state.currentDart++;
    this.state.isSubmitted = true;

    if (dart.getScore() === this.state.leg.round || (dart.getScore() === 25 && this.state.leg.round === 21)) {
        this.state.player.current_score += dart.getValue();
        this.emit('score-change', this.state.player.current_score, this.state.player.player_id);
    }

    var isCheckout = module.exports.isCheckout(this.state.leg, this.state.currentDart);
    if (isCheckout) {
        submitting = true;
    }
    if (!external) {
        // If an external event triggered the update don't emit a throw
        this.emit('possible-throw', isCheckout, false, this.state.currentDart - 1, dart.getScore(), dart.getMultiplier(), false);
    }
    return submitting;
}