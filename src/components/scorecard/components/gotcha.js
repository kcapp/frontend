const alertify = require("../../../util/alertify");

exports.removeLast = function(dart, external) {
    this.state.player.current_score -= dart.getValue();
    this.emit('score-change', this.state.player.current_score, this.state.player.player_id);

    // Reset other players back to their old score
    const players = this.input.players;
    for (let i = 0; i < players.length; i++) {
        const player = players[i];
        if (player.player_id === this.state.player.player_id) {
            continue;
        }
        if (this.state.player.current_score !== player.previous_score) {
            player.current_score = player.previous_score ? player.previous_score : player.current_score;
            this.emit('score-change', player.previous_score, player.player_id);
        }
    }

    if (!external) {
        this.emit('possible-throw', false, false, this.state.currentDart, -dart.getScore(), dart.getMultiplier(), true, false);
    }
}

exports.isBust = (currentScore, target) => {
    if (currentScore > target) {
        return true;
    }
    return false;
}

exports.isCheckout = (leg, player) => {
    if (player.current_score === leg.starting_score) {
        return true;
    }
    return false;
}

exports.confirmThrow = function (external) {
    let submitting = false;

    const dart = this.getCurrentDart();
    if (dart.getValue() === 0) {
        this.setDart(0, 1);
    }
    this.state.currentDart++;
    this.state.isSubmitted = true;

    this.state.player.current_score += dart.getValue();
    const players = this.input.players;
    for (let i = 0; i < players.length; i++) {
        const player = players[i];
        if (player.player_id === this.state.player.player_id) {
            continue;
        }
        if (player.current_score === this.state.player.current_score) {
            player.previous_score = player.current_score; // Keep a reference to old score
            player.current_score = 0;
            this.emit('score-change', 0, player.player_id);
        }
    }

    this.emit('score-change', this.state.player.current_score, this.state.player.player_id);

    const isCheckout = module.exports.isCheckout(this.state.leg, this.state.player);
    const isBust = module.exports.isBust(this.state.player.current_score, this.state.leg.starting_score);
    if (isCheckout) {
        submitting = true;
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
    if (!external) {
        // If an external event triggered the update don't emit a throw
        this.emit('possible-throw', isCheckout, false, this.state.currentDart - 1, dart.getScore(), dart.getMultiplier(), false, false);
    }
    return submitting;
}
