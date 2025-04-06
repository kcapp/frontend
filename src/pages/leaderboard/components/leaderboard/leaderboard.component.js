const _ = require('underscore');

module.exports = {
    onCreate(input) {
        const leaderboard = _.sortBy(input.leaderboard, 'three_dart_avg').reverse();
        const checkouts = _.sortBy(input.leaderboard, 'checkout').reverse();

        this.state = {
            officeId: 0,
            statistics: leaderboard,
            checkouts: checkouts
        }
    },
    officeChanged(officeId) {
        let statistics = this.input.leaderboard;
        let checkouts = this.input.leaderboard;
        if (officeId != 0) {
            statistics = _.reject(this.input.leaderboard, (stats) => stats.office_id != officeId);
            checkouts = _.reject(this.input.leaderboard, (stats) => stats.office_id != officeId);
        }
        this.state.statistics = _.sortBy(statistics, 'three_dart_avg').reverse();
        this.state.checkouts = _.sortBy(checkouts, 'checkout').reverse();
        this.state.officeId = officeId;
        this.setStateDirty("statistics");
    }
}