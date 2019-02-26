var moment = require("moment");

module.exports = {
    onCreate(input) {
        var leg = input.leg;

        leg.started = moment(leg.created_at).format('YYYY-MM-DD HH:mm:ss');
        leg.finished = leg.end_time === undefined ? '-' : moment(leg.end_time).format('YYYY-MM-DD HH:mm:ss');
        leg.duration = moment.duration(moment(leg.end_time).diff(leg.visits[0].created_at)).asMinutes().toFixed();

        this.state = {
            leg: leg
        }
    }
}