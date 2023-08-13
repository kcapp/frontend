const moment = require("moment");
const _ = require("underscore");

module.exports = {
    onCreate(input) {
        for (let i = 0; i < input.metadata.length; i++) {
            let metadata = input.metadata[i];
            let match = input.matches[metadata.match_id];
            match.start_time = moment(match.created_at).format('YYYY-MM-DD HH:mm');
        }
        const matches = _.reject(Object.values(input.matches), (match) => match.is_players_decided);
        this.state = {
            matchesMap: input.matches,
            matches: matches
        }
    },
    
    onShowModal(matchId) {
        const match = this.state.matchesMap[matchId];
        this.getComponent('set-score-modal').setMatch(match, false);
    }
}
