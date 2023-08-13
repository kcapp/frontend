const axios = require('axios');
const _ = require('underscore');

module.exports = {
    onCreate(input) {
        const matches = input.matches;
        const metadata = input.metadata;
        for (let i = 0; i < metadata.length; i++) {
            const data = metadata[i];
            const match = matches[data.match_id];
            if (match.is_finished && !match.is_bye) {
                const homeWins =  match.legs_won.filter(id => id === data.player_home).length;
                const awayWins =  match.legs_won.filter(id => id === data.player_away).length;
                match.result = homeWins + " - " + awayWins;
            }
        }
        this.state = {
            matches: matches,
            metadata: metadata,
            tournamentId: input.tournament.id
        }
    },
    onMount() {
        setInterval(() => {
            axios.all([
                axios.get(`${window.location.protocol}//${window.location.hostname}${this.input.locals.kcapp.api_path}/tournament/${this.state.tournamentId}/metadata`),
                axios.get(`${window.location.protocol}//${window.location.hostname}${this.input.locals.kcapp.api_path}/tournament/${this.state.tournamentId}/matches`)
            ]).then(axios.spread((metadataData, matchesData) => {
                var matches = matchesData.data;
                var metadata = metadataData.data;

                var matchesMap = {};
                for (var key in matches) {
                    _.extend(matchesMap, _.object(_.map(matches[key], function (match) {
                        return [match.id, match]
                    })));
                }

                metadata = _.sortBy(metadata, 'order_of_play');
                for (var i = 0; i < metadata.length; i++) {
                    var data = metadata[i];
                    var match = matchesMap[data.match_id];
                    if (match.is_finished) {
                        var homeWins =  match.legs_won.filter(id => id === data.player_home).length;
                        var awayWins =  match.legs_won.filter(id => id === data.player_away).length;
                        match.result = homeWins + " - " + awayWins;
                    }
                }

                this.state.metadata = metadata;
                this.state.matches = matchesMap;
                this.setStateDirty("matches");
                this.setStateDirty("metadata");
                console.log("Reloaded schedule...");
            })).catch(error => {
                console.log('Error when getting data for tournament ' + error);
            });
        }, 30000);
    }
}
