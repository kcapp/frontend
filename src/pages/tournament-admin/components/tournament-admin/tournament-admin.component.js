var moment = require("moment");

module.exports = {
    onCreate(input) {
        for (var i = 0; i < input.metadata.length; i++) {
            var metadata = input.metadata[i];
            var match = input.matches[metadata.match_id];
            match.start_time = moment(match.created_at).format('YYYY-MM-DD HH:mm');
        }
        this.state = {
            matches: input.matches
        }
    }
}
