module.exports = {
    onCreate(input) {
        var matches = input.matches;
        for (var i = 0; i < input.metadata.length; i++) {
            var metadata = input.metadata[i];
            var match = matches[metadata.match_id];
            if (match.is_finished) {
                var homeWins =  match.legs_won.filter(id => id === metadata.player_home).length;
                var awayWins =  match.legs_won.filter(id => id === metadata.player_away).length;
                match.result = homeWins + " - " + awayWins;
            }
        }
        this.state = {
            matches: matches
        }
    }
}