const _ = require("underscore");

module.exports = {
    onCreate(input) {
        this.state = {
            matches: this.copy(input.matches),
            overview: this.copy(input.overview)
        }
    },
    copy(array) {
        return JSON.parse(JSON.stringify(array));
    },
    onReset(event) {
        this.state.overview = this.copy(this.input.overview);
        this.setStateDirty("overview");
        this.state.matches = this.copy(this.input.matches);
        this.setStateDirty("matches");

        this.emit("update-predictions", this.state.overview[0].tournament_group.id, this.state.overview);
        event.preventDefault();
    },
    onPlayerClicked(value, player, event) {
        const matchId = parseInt(value);
        const match = this.state.matches.find(match => match.id === matchId);
        if (match.disabled) {
            // Don't allow clicking when score is already set
            return;
        }
        this.onSetScore(player, match.match_mode.wins_required, value, event);
        this.onLock(value, true, event);
    },
    onSetScore(player, points, value, event) {
        const matchId = parseInt(value);
        const match = this.state.matches.find(match => match.id === matchId);
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
        }


        this.setStateDirty("matches");
        event.preventDefault();
    },
    onLock(value, lock, event) {
        const matchId = parseInt(value);
        const match = this.state.matches.find(match => match.id === matchId);
        const overview = this.state.overview;
        const home = overview.find(row => row.player_id == match.players[0]);
        const away = overview.find(row => row.player_id == match.players[1]);

        const homeScore = match.score[0] ? match.score[0] : 0
        const awayScore = match.score[1] ? match.score[1] : 0

        if (lock) {
            home.legs_for += homeScore;
            home.legs_against += awayScore;
            home.legs_difference = home.legs_for - home.legs_against;
            home.played += 1;

            away.legs_for += awayScore;
            away.legs_against += homeScore;
            away.legs_difference = away.legs_for - away.legs_against;
            away.played += 1;

            if (homeScore === awayScore) {
                home.points += 1;
                home.matches_draw++;
                away.points += 1;
                away.matches_draw++;
            } else if (homeScore > awayScore) {
                home.points += 2;
                home.matches_won++;
                away.matches_lost++;
                match.winner_id = home.player_id;
            } else if (homeScore < awayScore) {
                away.points += 2;
                away.matches_won++;
                home.matches_lost++;
                match.winner_id = away.player_id;
            }
            match.disabled = true;
            match.locked = true;
        } else {
            home.legs_for -= homeScore;
            home.legs_against -= awayScore;
            home.legs_difference = home.legs_for - home.legs_against;
            home.played -= 1;

            away.legs_for -= awayScore;
            away.legs_against -= homeScore;
            away.legs_difference = away.legs_for - away.legs_against;
            away.played -= 1;

            if (homeScore === awayScore) {
                home.points -= 1;
                home.matches_draw--;
                away.points -= 1;
                away.matches_draw--;
            } else if (homeScore > awayScore) {
                home.points -= 2;
                home.matches_won--;
                away.matches_lost--;
                match.winner_id = null;
            } else if (homeScore < awayScore) {
                away.points -= 2;
                away.matches_won--;
                home.matches_lost--;
                match.winner_id = null;
            }
            match.disabled = false;
            match.locked = false;
        }
        this.emit("update-predictions", overview[0].tournament_group.id, overview);
        this.setStateDirty("overview");
        this.setStateDirty("matches");
        event.preventDefault();
    }
}