exports.removeLast = function(dart, external) {
    if (dart.getValue() === this.state.player.current_score && dart.getMultiplier() === 1) {
        this.state.player.current_score--;
        this.emit('score-change', this.state.player.current_score, this.state.player.player_id);
    }
    if (!external) {
        this.emit('possible-throw', false, false, this.state.currentDart, -dart.getScore(), dart.getMultiplier(), true);
    }
}

exports.isCheckout = (dart, player) => {
    if (player.current_score + 1 == 21 && dart.getValue() === 25) {
        return true;
    }
    return false;
}

exports.confirmThrow = function (external) {
    var submitting = false;

    var dart = this.getCurrentDart();
    if (dart.getValue() === 0) {
        this.setDart(0, 1);
    }
    this.state.currentDart++;
    this.state.isSubmitted = true;


    if (dart.getValue() === (this.state.player.current_score + 1) && dart.getMultiplier() === 1) {
        this.state.player.current_score++;
        this.emit('score-change', this.state.player.current_score, this.state.player.player_id);
    }

    var isCheckout = module.exports.isCheckout(dart, this.state.player);
    if (isCheckout) {
        submitting = true;
    }
    if (!external) {
        // If an external event triggered the update don't emit a throw
        this.emit('possible-throw', isCheckout, false, this.state.currentDart - 1, dart.getScore(), dart.getMultiplier(), false);
    }
    return submitting;
}