const alertify = require("../../../util/alertify");

exports.removeLast = function(dart, external) {
    const scored = dart.getValue();

    if (dart.getMultiplier() == 2 && this.state.player.current_score === 0) { 
        this.state.player.current_points--;
    }

    this.state.totalScore -= scored
    this.state.player.current_score += scored;
    this.state.player.darts_thrown--;
    this.emit('score-change', -scored, this.state.player.player_id);

    if (!external) {
        this.emit('possible-throw', false, false, this.state.currentDart, -dart.getScore(), dart.getMultiplier(), true, false);
    }
}


exports.isBust = (dart, player) => {
    const currentScore = player.current_score;
    if (currentScore <= 0) {
        return true;
    }
    
    if (dart.getMultiplier() == 2 && currentScore === 0) {
        // We checked out, so not a bust
        return false;
    }

    if (player.darts_thrown === 7) {
        for (let i = 20; i > 0; i--) {
            const possibleScore = currentScore - i*3;
            if ((possibleScore === 50 || possibleScore <= 40) && possibleScore%2 === 0) {
                // There is a way to checkout with two darts, so it's not a bust
                return false;
            }
        }
        // We cannot checkout in 2 darts, to bust
        return true;
    } else if (player.darts_thrown === 8) {
        if (currentScore > 50 || currentScore%2 !== 0 || (currentScore !== 50 && currentScore > 41)) {
            // We can checkout in 1 dart
            return true;
        }
    } else if (player.darts_thrown === 9) {
        // We didn't checkout in 9 so we bust
        return true;
    }
    return currentScore < 2;
}

exports.isCheckout = (dart, player, leg) => {
    if (dart.getMultiplier() == 2 && player.current_score === 0) { 
        player.current_points++;
    }
    return player.current_points >= leg.parameters.points_to_win;
}

exports.confirmThrow = function (external) {
    let submitting = false;

    let dart = this.getCurrentDart();
    if (dart.getValue() === 0) {
        this.setDart(0, 1);
    }
    this.state.currentDart++;
    this.state.isSubmitted = true;

    const scored = dart.getValue();
    this.state.totalScore += scored

    this.state.player.current_score -= scored;
    this.state.player.darts_thrown++;
    this.emit('score-change', -scored, this.state.player.player_id);

    const isBust = module.exports.isBust(dart, this.state.player);
    const isCheckout = module.exports.isCheckout(dart, this.state.player, this.state.leg);
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
    if (!external) {
        // Check if we have checked out without winning, and submit to move to next player if we did
        let submit = !isCheckout && dart.getMultiplier() == 2 && this.state.player.current_score === 0;

        // If an external event triggered the update don't emit a throw
        this.emit('possible-throw', isCheckout, false, this.state.currentDart - 1, dart.getScore(), dart.getMultiplier(), false, submit);
    }
    return submitting;
}