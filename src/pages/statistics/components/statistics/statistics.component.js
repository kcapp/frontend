var _ = require("underscore");
var moment = require("moment");

module.exports = {
    onCreate(input) {
        this.state = {
            x01: input.x01,
            shootout: input.shootout,
            from: input.from,
            to: input.to,
        }
    },
    navigatePrevious() {
        var from = moment(this.state.from).isoWeekday(-6).format('YYYY-MM-DD');
        var to = this.state.from;
        window.location.href = '/statistics/' + from + '/' + to;
    },
    navigateNext() {
        var from = this.state.to;
        var to = moment(this.state.to).isoWeekday(8).format('YYYY-MM-DD');
        var nextMonday = moment().isoWeekday(8).format('YYYY-MM-DD');
        if (to <= nextMonday) {
            window.location.href = '/statistics/' + from + '/' + to;
        }
    },
    officeChanged(officeId) {
        if (officeId == 0) {
            this.state.x01 = this.input.x01;
        } else {
            var players = this.input.players;
            this.state.x01 = _.reject(this.input.x01, function (stats) { 
                return players[stats.player_id].office_id != officeId ; 
            });
        }
        this.setStateDirty("x01");
    }
}