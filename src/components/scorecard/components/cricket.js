const DARTS = [ 20, 19, 18, 17, 16, 15, 25 ];
exports.DARTS = DARTS;

exports.removeLast = function(dart, external) {
    let score = dart.getScore();
    let hits = this.state.player.hits[score] ? this.state.player.hits[score].total : 0;

    if (DARTS.includes(score)) {
        if (this.state.player.hits[score].total) {
            this.state.player.hits[score].total -= dart.getMultiplier();
        }
        let multiplier = this.state.player.hits[score].total < 3 ? hits - dart.getMultiplier() : hits - this.state.player.hits[score].total;
        let points = score * multiplier;

        if (hits > 3) {
            const players = this.input.players;
            for (let i = 0; i < players.length; i++) {
                let player = players[i];
                if (player.player_id == this.state.player.player_id) {
                    continue;
                }

                if (!player.hits[score] || player.hits[score].total < 3) {
                    player.current_score -= points;
                    this.emit('score-change', -points, player.player_id);
                }
            }
        }
    }
    if (!external) {
        this.emit('possible-throw', false, false, this.state.currentDart, -dart.getScore(), dart.getMultiplier(), true, false);
    }
}

exports.isCheckout = (current, players) => {
    // Check if current player has closed all numbers
    let closed = true;
    let currentPlayer = {};
    for (let i = 0; i < players.length; i++) {
        let player = players[i];
        if (player.player_id == current.player_id) {
            currentPlayer = player;
            break;
        }
    }

    for (let i = 0; i < DARTS.length; i++) {
        let score = DARTS[i];

        if (!currentPlayer.hits[score] || currentPlayer.hits[score].total < 3) {
            closed = false;
            break;
        }
    }


    if (closed) {
        // What is the lowest score?
        let lowest = Number.MAX_VALUE;
        for (let i = 0; i < players.length; i++) {
            let player = players[i];

            if (player.current_score < lowest) {
                lowest = player.current_score;
            }
        }

        if (currentPlayer.current_score == lowest) {
            return true;
        }
    }
    return false;
}

exports.confirmThrow = function (external) {
    let submitting = false;

    let dart = this.getCurrentDart();
    if (dart.getValue() === 0) {
        this.setDart(0, 1);
    }
    this.state.currentDart++;
    this.state.isSubmitted = true;

    let score = dart.getScore();
    let isCheckout = false;
    if (DARTS.includes(score)) {
        let hits = this.state.player.hits[score];
        if (hits) {
            hits = hits.total;
            this.state.player.hits[score].total += dart.getMultiplier();
        } else {
            this.state.player.hits[score] = { total: dart.getMultiplier() } ;
            hits = 0;
        }
        let multiplier = hits < 3 ? this.state.player.hits[score].total - 3 : this.state.player.hits[score].total - hits;
        let points = score * multiplier;

        if (this.state.player.hits[score].total > 3) {
            const players = this.input.players;
            for (let i = 0; i < players.length; i++) {
                let player = players[i];
                if (player.player_id == this.state.player.player_id) {
                    continue;
                }

                if (!player.hits[score] || player.hits[score].total < 3) {
                    player.current_score += points;
                    this.emit('score-change', points, player.player_id);
                }
            }
        }
        isCheckout = module.exports.isCheckout(this.state.player, this.input.players);
        if (isCheckout) {
            submitting = true;
        }
    }
    if (!external) {
        // If an external event triggered the update don't emit a throw
        this.emit('possible-throw', isCheckout, false, this.state.currentDart - 1, dart.getScore(), dart.getMultiplier(), false, false);
    }
    return submitting;
}