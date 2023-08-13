const moment = require("moment");

module.exports = {
    onCreate(input) {
        const match = input.match;

        // Only show date of match if this is an official match
        const dateformat = match.tournament ? 'YYYY-MM-DD' : 'YYYY-MM-DD HH:mm';

        match.is_live = !match.is_finished && (moment().valueOf() - moment.utc(match.last_throw_time).valueOf()) / (1000 * 60) < 2;
        match.start_time = moment(match.created_at).format(dateformat);
        this.state = {
            match: match
        }
    },
    onShowModal(matchId) {
        this.emit('show-modal', matchId);
    }
}