const _ = require('underscore');

module.exports = {
    onCreate(input) {
        const x01_301 = _.filter(input.leaderboard[1], (stats) => stats.score === 301);
        const x01_501 = _.filter(input.leaderboard[1], (stats) => stats.score === 501);
        const x01_701 = _.filter(input.leaderboard[1], (stats) => stats.score === 701);

        const shootout = _.filter(input.leaderboard[2], (stats) => stats.darts_thrown > 9);
        const shootoutMax9 = _.filter(input.leaderboard[2], (stats) => stats.darts_thrown === 9);
        this.state = {
            x01_301: x01_301,
            x01_501: x01_501,
            x01_701: x01_701,
            shootout: shootout,
            shootoutMax9: shootoutMax9
        }
    }
}