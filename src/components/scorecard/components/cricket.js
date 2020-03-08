var DARTS = [ 20, 19, 18, 17, 16, 15, 25 ];
exports.DARTS = DARTS;

exports.removeLast = function(dart) {
    var score = dart.getScore();
    var hits = this.state.player.hits[score];

    if (DARTS.includes(score)) {
        if (this.state.player.hits[score]) {
            this.state.player.hits[score] -= dart.getMultiplier();
        }
        var multiplier = this.state.player.hits[score] < 3 ? 3 - this.state.player.hits[score] : hits - this.state.player.hits[score];
        var points = score * multiplier;

        if (hits > 3) {
            var players = this.state.players;
            for (var i = 0; i < players.length; i++) {
                var player = players[i];
                if (player.player_id == this.state.player.player_id) {
                    continue;
                }

                if (!player.hits[score] || player.hits[score] < 3) {
                    player.current_score -= points;
                    this.emit('score-change', -points, player.player_id);
                }
            }
        }
    }
    this.emit('possible-throw', false, false, this.state.currentDart, -dart.getScore(), dart.getMultiplier(), true);
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
    if (DARTS.includes(score)) {
        var hits = this.state.player.hits[score];
        if (hits) {
            this.state.player.hits[score] += dart.getMultiplier();
        } else {
            this.state.player.hits[score] = dart.getMultiplier();
        }
        var multiplier = hits < 3 ? this.state.player.hits[score] - 3 : this.state.player.hits[score] - hits;
        var points = score * multiplier;

        if (this.state.player.hits[score] > 3) {
            var players = this.state.players;
            for (var i = 0; i < players.length; i++) {
                var player = players[i];
                if (player.player_id == this.state.player.player_id) {
                    continue;
                }

                if (!player.hits[score] || player.hits[score] < 3) {
                    player.current_score += points;
                    this.emit('score-change', points, player.player_id);
                }
            }
        }
        this.emit('possible-throw', false, false, this.state.currentDart - 1, dart.getScore(), dart.getMultiplier(), false);
    }
    return submitting;
}