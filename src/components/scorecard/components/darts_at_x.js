exports.removeLast = function(dart) {
    var score = dart.getScore();
    if (dart.getMultiplier() === 3) {
        this.state.player.hits[score]['3']--;
    } else if (dart.getMultiplier() === 2) {
        this.state.player.hits[score]['2']--;
    } else {
        this.state.player.hits[score]['1']--;
    }
    this.state.player.darts_thrown--;

    if (score === this.state.leg.starting_score) {
        this.state.player.current_score -= dart.getMultiplier();
        this.emit('score-change', -dart.getMultiplier(), this.state.player.player_id);
    }

    this.emit('possible-throw', false, false, this.state.currentDart, -dart.getScore(), dart.getMultiplier(), true);
}

exports.isCheckout = (leg, currentDart) => {
    var visits = leg.visits.length;
    if (currentDart > 3) {
        visits++;
    }
    return visits > 0 && ((visits * 3) % (99 * leg.players.length) === 0);
}

exports.confirmThrow = function () {
    var submitting = false;

    var dart = this.getCurrentDart();
    if (dart.getValue() === 0) {
        this.setDart(0, 1);
    }
    this.state.currentDart++;
    this.state.isSubmitted = true;

    var score = dart.getScore();

    if (!this.state.player.hits[score]) {
        this.state.player.hits[score] = {};
    }

    if (dart.getMultiplier() === 3) {
        this.state.player.hits[score]['3'] ? this.state.player.hits[score]['3']++ : this.state.player.hits[score]['3'] = 1;
    } else if (dart.getMultiplier() === 2) {
        this.state.player.hits[score]['2'] ? this.state.player.hits[score]['2']++ : this.state.player.hits[score]['2'] = 1;
    } else {
        this.state.player.hits[score]['1'] ? this.state.player.hits[score]['1']++ : this.state.player.hits[score]['1'] = 1;
    }

    if (this.state.player.darts_thrown) {
        this.state.player.darts_thrown++;
    } else {
        this.state.player.darts_thrown = 1;
    }

    if (score === this.state.leg.starting_score) {
        this.state.player.current_score += dart.getMultiplier();
        this.emit('score-change', dart.getMultiplier(), this.state.player.player_id);
    }

    var isCheckout = module.exports.isCheckout(this.state.leg, this.state.currentDart);
    if (isCheckout) {
        submitting = true;
    }
    this.emit('possible-throw', isCheckout, false, this.state.currentDart - 1, dart.getScore(), dart.getMultiplier(), false);
    return submitting;
}