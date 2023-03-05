var moment = require("moment");

module.exports = {
    onCreate(input) {
        for (let i = 0; i < input.metadata.length; i++) {
            let metadata = input.metadata[i];
            let match = input.matches[metadata.match_id];
            match.start_time = moment(match.created_at).format('YYYY-MM-DD HH:mm');
        }
        this.state = {
            matches: input.matches
        }
    },
    onEditScore(event, element) {
        const matchId = parseInt(element.attributes['data-match-id'].value);
        const match = this.state.matches[matchId];
        this.getComponent('set-score-modal').setMatch(match);
    }
}
