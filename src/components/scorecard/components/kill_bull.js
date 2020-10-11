exports.removeLast = function(dart, external) {
    var scored = dart.getValue();

    if (dart.getScore() === 25) {
        this.state.player.current_score += scored;
        this.emit('score-change', scored, this.state.player.player_id);
    }
    if (!external) {
        this.emit('possible-throw', false, false, this.state.currentDart, dart.getScore(), dart.getMultiplier(), true, false);
    }
}

exports.isCheckout = (leg, player) => {
    if (player.current_score <= 0) {
        return true;
    }
    return false;
}

exports.confirmThrow = function (external) {
    var submitting = false;

    var dart = this.getCurrentDart();
    var scored = dart.getValue();
    if (dart.getValue() === 0) {
        this.setDart(0, 1);
    }
    this.state.currentDart++;
    this.state.isSubmitted = true;

    if (dart.getScore() === 25) {
        this.state.player.current_score -= scored;
        this.emit('score-change', scored, this.state.player.player_id);
    }

    var isCheckout = module.exports.isCheckout(this.state.leg, this.state.player);
    if (isCheckout) {
        submitting = true;
    }

    if (!external) {
        // If an external event triggered the update don't emit a throw
        this.emit('possible-throw', isCheckout, false, this.state.currentDart - 1, dart.getScore(), dart.getMultiplier(), false, false);
    }

    return submitting;
}
