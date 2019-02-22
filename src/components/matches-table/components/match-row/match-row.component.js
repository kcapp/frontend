const moment = require("moment");

module.exports = {
    onCreate(input) {
        var match = input.match;

        // Only show date of match if this is an official match
        var dateformat = match.tournament ? 'YYYY-MM-DD' : 'YYYY-MM-DD HH:mm';

        match.is_live = !match.is_finished && moment.duration(moment().diff(match.last_throw_time)).asMinutes().toFixed() < 2;
        match.start_time = moment(match.created_at).format(dateformat);
        this.state = {
            match: match
        }
    }
}