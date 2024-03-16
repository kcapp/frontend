const alertify = require("../../../util/alertify");

exports.removeLast = function(dart, external) {
    const value = dart.getValue();
    this.state.player.current_score -= value;
    this.state.player.darts_thrown--;
    this.state.totalScore -= scored;

    this.emit('score-change', value, this.state.player.player_id);
    if (!external) {
        this.emit('possible-throw', false, false, this.state.currentDart, dart.getScore(), dart.getMultiplier(), true, false);
    }
}

exports.isCheckout = function(leg, currentDart, players) {
    let visits = leg.visits.length;
    if (currentDart > 3) {
        visits++;
    }
    let isCheckout = visits > 0 && ((visits * 3) >= (9 * leg.players.length));
    if (isCheckout) {
        if (currentDart <= 3) {
            // We are in the middle of a visit, so don't finish
            return false;
        }

        if (players.length === 2) {
            const scores = [];
            for (let i = 0; i < players.length; i++) {
                scores[i] = players[i];
            }
            // If both players have thrown the same amount of darts, and have different scores, game is finished
            isCheckout = scores[0].darts_thrown === scores[1].darts_thrown && scores[0].current_score !== scores[1].current_score
        }
    }
    return isCheckout;
}

exports.confirmThrow = function (external) {
    let submitting = false;
    const dart = this.getCurrentDart();
    const scored = dart.getValue();
    if (scored === 0) {
        this.setDart(0, 1);
    }
    this.state.totalScore += scored;
    this.state.currentDart++;
    this.state.isSubmitted = true;

    this.state.player.current_score += scored;
    this.state.player.darts_thrown++;
    this.emit('score-change', -scored, this.state.player.player_id);
    const isCheckout = module.exports.isCheckout(this.state.leg, this.state.currentDart, this.input.players);
    if (isCheckout) {
        submitting = true;
        alertify.confirm('Leg will be finished.',
            () => {
                this.emit('leg-finished', true);
            }, () => {
                this.removeLast();
                this.emit('leg-finished', false);
            });
    }

    if (!external) {
        this.emit('possible-throw', isCheckout, false, this.state.currentDart - 1, dart.getScore(), dart.getMultiplier(), false, false);
    }
    return submitting;
}
