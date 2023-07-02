exports.removeLast = function(dart, external) {
    const scored = dart.getValue();

    if (this.state.currentDart === 3) {
        const visits = this.state.leg.visits;
        if (visits.length !== 0) {
            const prev = visits[visits.length - 1];
            if (this.state.player.current_score < prev.score) {
                this.state.player.lives++;
            }
        }
    }

    this.state.player.current_score -= scored;
    this.emit('score-change', scored, this.state.player.player_id);

    if (!external) {
        this.emit('possible-throw', false, false, this.state.currentDart, dart.getScore(), dart.getMultiplier(), true, false);
    }
}

exports.isCheckout = (players) => {
    let playersAlive = 0
    for (let i = 0; i < players.length; i++) {
        const player = players[i];
        if (player.lives > 0) {
            playersAlive++;
        }
    }
    return playersAlive < 2;
}

exports.confirmThrow = function (external) {
    let submitting = false;

    const dart = this.getCurrentDart();
    const scored = dart.getValue();
    if (dart.getValue() === 0) {
        this.setDart(0, 1);
    }
    this.state.currentDart++;
    this.state.isSubmitted = true;
    this.state.player.current_score += scored;

    // Find previous player score
    if (this.state.currentDart > 3) {
        const visits = this.state.leg.visits;
        const prev = visits[visits.length - 1];
        if (prev) {
            if (this.state.player.current_score < prev.score) {
                this.state.player.lives--;
            }
        }
    }

    this.emit('score-change', scored, this.state.player.player_id);

    const isCheckout = module.exports.isCheckout(this.input.players);
    if (isCheckout) {
        submitting = true;
    }

    if (!external) {
        // If an external event triggered the update don't emit a throw
        this.emit('possible-throw', isCheckout, false, this.state.currentDart - 1, dart.getScore(), dart.getMultiplier(), false, false);
    }

    return submitting;
}
