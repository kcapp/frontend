const _ = require('underscore');

module.exports = {
    onCreate(input) {
        const shootout = _.filter(input.leaderboard[2], (stats) => stats.darts_thrown > 9);
        const shootoutMax9 = _.filter(input.leaderboard[2], (stats) => stats.darts_thrown === 9);
        this.state = {
            shootout: shootout,
            shootoutMax9: shootoutMax9
        }
    }
}