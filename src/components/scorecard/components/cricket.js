var DARTS = [ 20, 19, 18, 17, 16, 15, 25 ];
exports.DARTS = DARTS;

exports.removeLast = function(dart) {
    var score = dart.getScore();
    var hits = this.state.player.hits[score].total;

    if (DARTS.includes(score)) {
        if (this.state.player.hits[score].total) {
            this.state.player.hits[score].total -= dart.getMultiplier();
        }
        var multiplier = this.state.player.hits[score].total < 3 ? hits - dart.getMultiplier() : hits - this.state.player.hits[score].total;
        var points = score * multiplier;

        if (hits > 3) {
            var players = this.state.players;
            for (var i = 0; i < players.length; i++) {
                var player = players[i];
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
    this.emit('possible-throw', false, false, this.state.currentDart, -dart.getScore(), dart.getMultiplier(), true);
}

exports.isCheckout = (current, players) => {
    // Check if current player has closed all numbers
    var closed = true;
    var currentPlayer = {};
    for (var i = 0; i < players.length; i++) {
        var player = players[i];
        if (player.player_id == current.player_id) {
            currentPlayer = player;
            break;
        }
    }

    for (var i = 0; i < DARTS.length; i++) {
        var score = DARTS[i];

        if (!currentPlayer.hits[score] || currentPlayer.hits[score].total < 3) {
            closed = false;
            break;
        }
    }


    if (closed) {
        // What is the lowest score?
        var lowest = Number.MAX_VALUE;
        for (var i = 0; i < players.length; i++) {
            var player = players[i];

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
    var submitting = false;

    var dart = this.getCurrentDart();
    if (dart.getValue() === 0) {
        this.setDart(0, 1);
    }
    this.state.currentDart++;
    this.state.isSubmitted = true;

    var score = dart.getScore();
    var isCheckout = false;
    if (DARTS.includes(score)) {
        var hits = this.state.player.hits[score];
        if (hits) {
            hits = hits.total;
            this.state.player.hits[score].total += dart.getMultiplier();
        } else {
            this.state.player.hits[score] = { total: dart.getMultiplier() } ;
            hits = 0;
        }
        var multiplier = hits < 3 ? this.state.player.hits[score].total - 3 : this.state.player.hits[score].total - hits;
        var points = score * multiplier;

        if (this.state.player.hits[score].total > 3) {
            var players = this.state.players;
            for (var i = 0; i < players.length; i++) {
                var player = players[i];
                if (player.player_id == this.state.player.player_id) {
                    continue;
                }

                if (!player.hits[score] || player.hits[score].total < 3) {
                    player.current_score += points;
                    this.emit('score-change', points, player.player_id);
                }
            }
        }
        isCheckout = module.exports.isCheckout(this.state.player, this.state.players);
        if (isCheckout) {
            submitting = true;
        }
    }
    if (!external) {
        // If an external event triggered the update don't emit a throw
        this.emit('possible-throw', isCheckout, false, this.state.currentDart - 1, dart.getScore(), dart.getMultiplier(), false);
    }
    return submitting;
}