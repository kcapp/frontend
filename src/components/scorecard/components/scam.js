
exports.removeLast = function(dart, external) {
    const player = this.state.player;
    if (player.is_stopper && dart.getMultiplier() === 1) {
        player.hits[dart.getScore()] = undefined;
    } else if (player.is_scorer) {
        let stopper = getStopper(this.state.players);
        if (!stopper.hits[dart.getScore()]) {
            let score = dart.getValue();
            player.current_score -= score;
            this.emit('score-change', -score, this.state.player.player_id);
        }
    }

    if (!external) {
        this.emit('possible-throw', false, false, this.state.currentDart, -dart.getScore(), dart.getMultiplier(), true, false);
    }
}

exports.isCheckout = (currentPlayer, players) => {
    if (currentPlayer.is_scorer) {
        // Scorer can never checkout
        return false;
    }

    let finished = true;
    for (let i = 0; i < players.length; i++) {
        const player = players[i];

        for (let i = 1; i <= 20; i++) {
            if (!player.hits[i] || !player.hits[i]['1']) {
                finished = false;
                break;
            }
        }
    }
    return finished;
}

exports.confirmThrow = function (external) {
    let submitting = false;

    let dart = this.getCurrentDart();
    if (dart.getValue() === 0) {
        this.setDart(0, 1);
    }
    this.state.currentDart++;
    this.state.isSubmitted = true;

    let allClosed = true;
    const player = this.state.player;
    if (player.is_stopper) {
        if (dart.getMultiplier() === 1) {
            player.hits[dart.getScore()] = { '1': 1 };
        }

        for (let i = 1; i <= 20; i++) {
            if (!player.hits[i] || !player.hits[i]['1']) {
                allClosed = false;
            }
        }
    } else if (player.is_scorer) {
        let stopper = getStopper(this.state.players);
        // Only allow hits if other player has not stopped the number
        if (!stopper.hits[dart.getScore()] || !stopper.hits[dart.getScore()]['1']) {
            let score = dart.getValue();
            player.current_score += score;
            this.emit('score-change', score, this.state.player.player_id);
        }
        allClosed = false;
    }

    const isCheckout = module.exports.isCheckout(player, this.state.players);
    if (isCheckout) {
        submitting = true;
    }

    // Automatically send darts if we have closed all numbers and it's not a checkout
    let submit = false;
    if (allClosed && !isCheckout) {
        submit = true;
        submitting = true
    }
    if (!external) {
        // If an external event triggered the update don't emit a throw
        this.emit('possible-throw', isCheckout, false, this.state.currentDart - 1, dart.getScore(), dart.getMultiplier(), false, submit);
    }
    return submitting;
}

function getStopper(players) {
    for (let i = 0; i < players.length; i++) {
        const player = players[i];
        if (player.is_stopper) {
            return player;
        }
    }
}