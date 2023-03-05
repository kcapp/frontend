const axios = require('axios');

module.exports = {
    onCreate(input) {
        this.state = {
            homePlayerId: 0,
            homeScore: 0,
            awayPlayerId: 0,
            awayScore: 0
        }
    },
    setMatch(match) {
        this.state.homePlayerId = match.players[0];
        this.state.homeScore = 0;
        this.state.awayPlayerId = match.players[1];
        this.state.awayScore = 0;
    },
    homeScoreChange(event) {
        this.state.homeScore = event.target.value;
    },
    awayScoreChange(event) {
        this.state.awayScore = event.target.value;
    },
    addPlayer(event) {
        const body = {
            winner_id: this.state.homePlayerId,
            winner_score: this.state.homeScore,
            looser_id: this.state.awayPlayerId,
            looser_score: this.state.awayScore
        };

        axios.put(`${window.location.origin}/tournaments/${this.state.id}`, body)
            .then(response => {
                location.href = 'players';
            }).catch(error => {
                console.log(error);
            });
        event.preventDefault();
    }
}