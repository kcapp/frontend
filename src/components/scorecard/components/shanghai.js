exports.removeLast = function(dart, external) {
    if (dart.getScore() === this.state.leg.round || (dart.getScore() === 25 && this.state.leg.round === 21)) {
        this.state.player.current_score -= dart.getMultiplier();
        this.emit('score-change', this.state.player.current_score, this.state.player.player_id);
    }
    if (!external) {
        this.emit('possible-throw', false, false, this.state.currentDart, -dart.getScore(), dart.getMultiplier(), true, false);
    }
}

exports.isShanghai = (visit, target) =>  {
    const first = visit.first_dart;
    const second = visit.second_dart;
    const third = visit.third_dart;

    if (first.value === second.value && first.value === third.value && first.value === target) {
        if ((first.multiplier === 1 && second.multiplier === 2 && third.multiplier === 3) ||
            (first.multiplier === 2 && second.multiplier === 3 && third.multiplier === 1) ||
            (first.multiplier === 3 && second.multiplier === 1 && third.multiplier === 2) ||
            (first.multiplier === 3 && second.multiplier === 2 && third.multiplier === 1) ||
            (first.multiplier === 1 && second.multiplier === 3 && third.multiplier === 2) ||
            (first.multiplier === 2 && second.multiplier === 1 && third.multiplier === 3)) {
                return true;
        }
    }
    return false;
}


exports.isCheckout = (leg, visit, currentDart) => {
    let visits = leg.visits.length;
    if (currentDart > 3) {
        visits++;

        const shanghai = module.exports.isShanghai(visit, leg.round);
        if (shanghai) {
            return true;
        }
    }
    return visits > 0 && (visits % (20 * leg.players.length) === 0);
}

exports.confirmThrow = function (external) {
    var submitting = false;

    var dart = this.getCurrentDart();
    if (dart.getValue() === 0) {
        this.setDart(0, 1);
    }
    this.state.currentDart++;
    this.state.isSubmitted = true;

    if (dart.getScore() === this.state.leg.round) {
        this.state.player.current_score += dart.getMultiplier();
        this.emit('score-change', this.state.player.current_score, this.state.player.player_id);
    }

    var isCheckout = module.exports.isCheckout(this.state.leg, this.getPayload(), this.state.currentDart);
    if (isCheckout) {
        submitting = true;
    }
    if (!external) {
        // If an external event triggered the update don't emit a throw
        this.emit('possible-throw', isCheckout, false, this.state.currentDart - 1, dart.getScore(), dart.getMultiplier(), false, false);
    }
    return submitting;
}
