const alertify = require("../../../util/alertify");

exports.removeLast = function(dart, external) {
    let value = dart.getValue();
    this.state.totalScore -= value;
    if (!this.state.player.player.options || this.state.player.player.options.subtract_per_dart) {
        this.state.player.current_score += value;
    }
    this.emit('score-change', -value, this.state.player.player_id);
    if (!external) {
        this.emit('possible-throw', false, false, this.state.currentDart, -dart.getScore(), dart.getMultiplier(), true, false);
    }
}

exports.isBust = (currentScore, dart, totalScore, player) => {
    if (player.player.options && !player.player.options.subtract_per_dart) {
        if (currentScore - totalScore < 2) {
            return true;
        }
    } else {
        if (currentScore - dart.getValue() < 2) {
            return true;
        }
    }
    return false;
}

exports.isCheckout = (currentScore, dart, totalScore, player) => {
    if (player.player.options && !player.player.options.subtract_per_dart) {
        if (currentScore - totalScore === 0 && dart.getMultiplier() === 2) {
            return true;
        }
    } else {
        if (currentScore - dart.getValue() === 0 && dart.getMultiplier() === 2) {
            return true;
        }
    }
    return false;
}

exports.confirmThrow = function (external) {
    var submitting = false;

    var dart = this.getCurrentDart();
    var scored = dart.getValue();
    if (scored === 0) {
        this.setDart(0, 1);
    }
    this.state.currentDart++;
    this.state.isSubmitted = true;

    this.state.totalScore += scored;

    this.emit('score-change', scored, this.state.player.player_id);

    var isCheckout = module.exports.isCheckout(this.state.player.current_score, dart, this.state.totalScore, this.state.player);
    var isBust = module.exports.isBust(this.state.player.current_score, dart, this.state.totalScore, this.state.player);
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
    if (!this.state.player.player.options || this.state.player.player.options.subtract_per_dart) {
        this.state.player.current_score -= scored;
    }
    if (!external) {
        // If an external event triggered the update don't emit a throw
        this.emit('possible-throw', isCheckout, isBust, this.state.currentDart - 1, dart.getScore(), dart.getMultiplier(), false, false);
    }
    return submitting;
}
