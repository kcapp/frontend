const scorecardComponent = require("../scorecard.component");

exports.removeLast = function(dart, external) {
    var value = dart.getValue();
    this.state.player.current_score -= value;
    this.emit('score-change', value, this.state.player.player_id);

    if (dart.getMultiplier() === 2) {
        var total = this.getDart(1).getValue() + this.getDart(2).getValue() + this.getDart(3).getValue();

        for (var i = 0; i < this.state.leg.parameters.numbers.length; i++) {
            var num = this.state.leg.parameters.numbers[i];
            if (total === num) {
                delete this.state.leg.parameters.hits[num];
                break;
            }
        }
    }

    if (!external) {
        this.emit('possible-throw', false, false, this.state.currentDart, dart.getScore(), dart.getMultiplier(), true, false);
    }
}

exports.isCheckout = (leg, player) => {
    // Need to check if player has three in a row
    var numbers = leg.parameters.numbers;
    var hits = leg.parameters.hits;

    function isHit(idx, player) {
        return hits[numbers[idx]] === player;
    }

    var playerId = player.player_id;

    var winningCombos = [
        // Horizontally
        [0, 1, 2],
        [3, 4, 5],
        [6, 7, 8],

        // Diagonally
        [0, 4, 8],
        [2, 4, 6],

        // Vertically
        [0, 3, 6],
        [1, 4, 7],
        [2, 5, 8]
    ]

    var draw = true;
    for (var i = 0; i < winningCombos.length; i++) {
        var combo = winningCombos[i];
        if (isHit(combo[0], playerId) && isHit(combo[1], playerId) && isHit(combo[2], playerId)) {
            return true;
        }

        var num1 = numbers[combo[0]];
        var num2 = numbers[combo[1]];
        var num3 = numbers[combo[2]];
        if (
           (hits[num1] && hits[num2] && hits[num1] != hits[num2]) ||
           (hits[num1] && hits[num3] && hits[num1] != hits[num3]) ||
           (hits[num2] && hits[num3] && hits[num2] != hits[num3])) {
            // Two numbers are taken by two different players, which means this combo cannot be completed
            continue;
        }
        draw = false
    }

    if (draw || Object.keys(hits).length === 9) {
        // All fields are hit and no one won, so finish with a draw
        return true;
    }
    return false;
}

exports.confirmThrow = function (external) {
    var submitting = false;

    var dart = this.getCurrentDart();
    var scored = dart.getValue();
    if (dart.getValue() === 0) {
        this.setDart(0, 1);
    }
    this.state.currentDart++;
    this.state.isSubmitted = true;
    this.state.player.current_score += scored;

    this.emit('score-change', scored, this.state.player.player_id);

    var submit = false;
    if (dart.getMultiplier() === 2) {
        var total = this.getDart(1).getValue() + this.getDart(2).getValue() + this.getDart(3).getValue();

        for (var i = 0; i < this.state.leg.parameters.numbers.length; i++) {
            var num = this.state.leg.parameters.numbers[i];
            if (total === num) {
                this.state.leg.parameters.hits[num] = this.state.player.player_id;
                submit = true;
                break;
            }
        }
    }

    var isCheckout = module.exports.isCheckout(this.state.leg, this.state.player);
    if (isCheckout) {
        submit = false;
        submitting = true;
    }
    if (!external) {
        // If an external event triggered the update don't emit a throw
        this.emit('possible-throw', isCheckout, false, this.state.currentDart - 1, dart.getScore(), dart.getMultiplier(), false, submit);
    }
    return submitting;
}
