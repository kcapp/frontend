const moment = require("moment");

module.exports = {
    onCreate(input) {
        this.state = {
            x01: input.x01,
            shootout: input.shootout,
            from: input.from,
            to: input.to
        }
    },
    navigatePrevious() {
        var from = moment(this.state.from).isoWeekday(-6).format('YYYY-MM-DD');
        var to = this.state.from;
        window.location.href = '/statistics/' + from + '/' + to;
    },
    navigateNext() {
        var from = this.state.to;
        var to = moment(this.state.from).isoWeekday(8).format('YYYY-MM-DD');
        window.location.href = '/statistics/' + from + '/' + to;
    }
}