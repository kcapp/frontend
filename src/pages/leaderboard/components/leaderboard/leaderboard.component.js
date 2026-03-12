const _ = require('underscore');

module.exports = {
    onCreate(input) {
        const x01Leaderboard = _.sortBy(input.x01Leaderboard, 'three_dart_avg').reverse();
        const checkouts = _.sortBy(input.x01Leaderboard, 'checkout').reverse();

        this.state = {
            officeId: 0,
            statistics: x01Leaderboard,
            checkouts: checkouts,
            matchTypesLeaderboard: input.matchTypesLeaderboard
        }
    },
    officeChanged(officeId) {
        let statistics = this.input.x01Leaderboard;
        let checkouts = this.input.x01Leaderboard;
        if (officeId != 0) {
            statistics = _.reject(this.input.x01Leaderboard, (stats) => stats.office_id != officeId);
            checkouts = _.reject(this.input.x01Leaderboard, (stats) => stats.office_id != officeId);
        }
        this.state.statistics = _.sortBy(statistics, 'three_dart_avg').reverse();
        this.state.checkouts = _.sortBy(checkouts, 'checkout').reverse();
        this.state.officeId = officeId;
        this.setStateDirty("statistics");
    }
}