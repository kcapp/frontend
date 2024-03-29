const types = require("./match_types");
const WINNING_COMBOS = [
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

let hit = null;

exports.reset = function() {
    hit = null;
}

exports.removeLast = function(dart, external) {
    let scored = dart.getValue();
    this.state.player.current_score -= scored;
    this.emit('score-change', scored, this.state.player.player_id);

    const outshotTypeId = this.state.leg.parameters.outshot_type.id;
    if ((outshotTypeId == types.OUTSHOT_ANY) ||
        (outshotTypeId == types.OUTSHOT_DOUBLE && dart.getMultiplier() == 2) ||
        (outshotTypeId == types.OUTSHOT_MASTER && (dart.getMultiplier() == 2 || dart.getMultiplier() == 3))) {
        const total = this.getDart(1).getValue() + this.getDart(2).getValue() + this.getDart(3).getValue();

        for (let i = 0; i < this.state.leg.parameters.numbers.length; i++) {
            const num = this.state.leg.parameters.numbers[i];
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
    const numbers = leg.parameters.numbers;
    const hits = leg.parameters.hits;

    function isHit(idx, player) {
        return hits[numbers[idx]] === player;
    }

    const playerId = player.player_id;

    let draw = true;
    for (let i = 0; i < WINNING_COMBOS.length; i++) {
        const combo = WINNING_COMBOS[i];
        if (isHit(combo[0], playerId) && isHit(combo[1], playerId) && isHit(combo[2], playerId)) {
            return true;
        }

        const num1 = numbers[combo[0]];
        const num2 = numbers[combo[1]];
        const num3 = numbers[combo[2]];
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
    let submitting = false;

    const dart = this.getCurrentDart();
    const scored = dart.getValue();
    if (dart.getValue() === 0) {
        this.setDart(0, 1);
    }
    this.state.currentDart++;
    this.state.isSubmitted = true;
    this.state.player.current_score += scored;

    this.emit('score-change', scored, this.state.player.player_id);

    const outshotTypeId = this.state.leg.parameters.outshot_type.id;
    if ((outshotTypeId == types.OUTSHOT_ANY) ||
        (outshotTypeId == types.OUTSHOT_DOUBLE && dart.getMultiplier() == 2) ||
        (outshotTypeId == types.OUTSHOT_MASTER && (dart.getMultiplier() == 2 || dart.getMultiplier() == 3))) {
        const total = this.getDart(1).getValue() + this.getDart(2).getValue() + this.getDart(3).getValue();

        for (let i = 0; i < this.state.leg.parameters.numbers.length; i++) {
            const num = this.state.leg.parameters.numbers[i];
            if (total === num && !this.state.leg.parameters.hits[num]) {
                this.state.leg.parameters.hits[num] = this.state.player.player_id;
                if (hit && hit !== num) {
                    delete this.state.leg.parameters.hits[hit]
                }
                hit = num
                break;
            }
        }
    }

    const isCheckout = module.exports.isCheckout(this.state.leg, this.state.player);
    if (isCheckout) {
        submitting = true;
    }

    if (!external) {
        // If an external event triggered the update don't emit a throw
        this.emit('possible-throw', isCheckout, false, this.state.currentDart - 1, dart.getScore(), dart.getMultiplier(), false, false);
    }

    return submitting;
}
