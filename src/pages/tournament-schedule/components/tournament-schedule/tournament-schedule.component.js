var axios = require('axios');
var _ = require('underscore');

module.exports = {
    onCreate(input) {
        var matches = input.matches;
        var metadata = input.metadata;
        for (var i = 0; i < metadata.length; i++) {
            var data = metadata[i];
            var match = matches[data.match_id];
            if (match.is_finished) {
                var homeWins =  match.legs_won.filter(id => id === data.player_home).length;
                var awayWins =  match.legs_won.filter(id => id === data.player_away).length;
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
                axios.get(this.input.locals.kcapp.api_external + '/tournament/' + this.state.tournamentId + '/metadata'),
                axios.get(this.input.locals.kcapp.api_external + '/tournament/' + this.state.tournamentId + '/matches')
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
