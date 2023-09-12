const axios = require('axios');

module.exports = {
    onCreate(input) {
        this.state = {
            matchId: 0,
            homePlayerId: 0,
            homeScore: 0,
            awayPlayerId: 0,
            awayScore: 0,
            isBracket: false
        }
    },
    onMount() {
        $(function() {
            $("#set-score-modal").on('shown.bs.modal', function(){
                const matchId = $("#set-score-modal").data('matchId');
                if (matchId) {
                    this.setMatch(matchId, true);
                }
            }.bind(this));
        }.bind(this));
    },
    setMatch(matchId, isBracket) {
        const match = this.input.matches[matchId];
        this.state.matchId = match.id;
        this.state.homePlayerId = match.players[0];
        this.state.awayPlayerId = match.players[1];
        if (match.legs_won) {
            this.state.homeScore = match.legs_won.filter(winnerId => winnerId === match.players[0]).length;
            this.state.awayScore = match.legs_won.filter(winnerId => winnerId === match.players[1]).length;
        } else {
            this.state.homeScore = 0;
            this.state.awayScore = 0;
        }
        this.state.isBracket = isBracket;
    },
    homeScoreChange(event) {
        this.state.homeScore = parseInt(event.target.value);
    },
    awayScoreChange(event) {
        this.state.awayScore = parseInt(event.target.value);
    },
    saveScore(event) {
        let winner = {};
        let looser = {};
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
                if (!location.hash) {
                    location.href = `${location.href}#bracket`;
                }
                if (!this.state.isBracket) {
                    //location.hash =  "";
                    history.replaceState({}, document.title, `${location.pathname}${location.search}`);
                }
                location.reload();
            }).catch(error => {
                console.log(error);
            });
        event.preventDefault();
    }
}