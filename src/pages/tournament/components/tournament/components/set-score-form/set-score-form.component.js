const axios = require('axios');

module.exports = {
    onCreate(input) {
        this.state = {
            matchId: 0,
            isBracket: false,
            numLegs: 1,
            match: undefined
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
        this.state.match = match;
        this.state.matchId = match.id;
        this.state.numLegs = match.match_mode.wins_required;
        this.state.isBracket = isBracket;
    },
    onSetScore(player, points, event) {
        const match = this.state.match;
        if (!match.score) {
            match.score = [];
        }
        match.score[player] = parseInt(points);
        const opponent = player === 0 ? 1 : 0;
        match.score[opponent] = match.score[opponent] ? match.score[opponent] : 0;
        match.total_score = match.score.reduce((acc, val) => acc + val, 0);

        const winsRequired = match.match_mode.wins_required;
        const legsRequired = match.match_mode.legs_required;
        if (legsRequired) {
            if ((match.score[0] === winsRequired || match.score[1] === winsRequired) && match.total_score <= legsRequired) {
                match.is_correct_score = true;
            } else if (match.total_score === legsRequired) {
                match.is_correct_score = true;
            } else {
                match.is_correct_score = false;
            }
        } else if (match.score[0] === winsRequired || match.score[1] === winsRequired) {
            match.is_correct_score = true;
        } else {
            match.is_correct_score = false;
        }
        this.setStateDirty("match");
        event.preventDefault();
    },
    saveScore(event) {
        const homeScore = this.state.match.score[0];
        const awayScore = this.state.match.score[1];
        if (homeScore > awayScore) {
            winner = { id: this.state.match.players[0], score: homeScore };
            looser = { id: this.state.match.players[1], score: awayScore };
        } else {
            winner = { id: this.state.match.players[1], score: awayScore };
            looser = { id: this.state.match.players[0], score: homeScore };
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
                    history.replaceState({}, document.title, `${location.pathname}${location.search}`);
                }
                location.reload();
            }).catch(error => {
                console.log(error);
            });
        event.preventDefault();
    }
}