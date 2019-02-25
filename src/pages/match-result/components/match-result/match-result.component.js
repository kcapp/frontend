var moment = require("moment");

module.exports = {
    onCreate(input) {
        var match = input.match;

        match.started = moment(match.created_at).format('YYYY-MM-DD HH:mm:ss');
        match.finished = match.end_time === undefined ? '-' : moment(match.end_time).format('YYYY-MM-DD HH:mm:ss');
        match.duration = moment.duration(moment(match.last_throw_time).diff(match.first_throw_time)).asMinutes().toFixed();

        this.state = {
            match: match
        }
    }
}