const axios = require('axios');

module.exports = {
    onCreate(input) {
        this.state = {
            matchId: 0,
            homePlayerId: 0,
            homeScore: 0,
            awayPlayerId: 0,
            awayScore: 0
        }
    },
    setMatch(match) {
        this.state.matchId = match.id;
        this.state.homePlayerId = match.players[0];
        this.state.homeScore = 0;
        this.state.awayPlayerId = match.players[1];
        this.state.awayScore = 0;
    },
    homeScoreChange(event) {
        this.state.homeScore = parseInt(event.target.value);
    },
    awayScoreChange(event) {
        this.state.awayScore = parseInt(event.target.value);
    },
    saveScore(event) {
        const winner = {};
        const looser = {};
        if (this.state.homeScore > this.state.awayScore) {
            winner = { id: this.state.homePlayerId, score: this.state.homeScore };
            looser = { id: this.state.awayPlayerId, score: this.state.awayScore };
        } else {
            winner = { id: this.state.awayPlayerId, score: this.state.awayScore};
            looser = { id: this.state.homePlayerId, score: this.state.homeScore };
        }

        const body = {
            winner_id: winner.id,
            winner_score: winner.score,
            looser_id: looser.id,
            looser_score: looser.score
        };

        axios.put(`${window.location.origin}/matches/${this.state.matchId}/finish`, body)
            .then(response => {
                // TODO just close modal and reload data instead of reloading page
                //$('#set-score-modal').modal('hide');
                location.reload();
            }).catch(error => {
                console.log(error);
            });
        event.preventDefault();
    }
}