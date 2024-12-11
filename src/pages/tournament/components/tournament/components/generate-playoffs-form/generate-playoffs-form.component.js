const _ = require("underscore");
const axios = require('axios');

module.exports = {
    onCreate(input) {
        const numPlayers = Object.values(input.overview).flat().length;
        const modes = _.sortBy(input.modes, 'name');
        const defaultModeId = Object.values(input.matches)[0][0].match_mode.id;
        this.state = {
            matchModes: modes,
            match_mode_last32: defaultModeId,
            match_mode_last16: defaultModeId,
            match_mode_quarterFinals: defaultModeId,
            match_mode_semiFinals: defaultModeId,
            match_mode_grandFinals: defaultModeId,
            numPlayers: numPlayers
        }
    },
    onMatchTypeChange(key, event) {
        this.state[`match_mode_${key}`] = parseInt(event.target.value);
    },
    generatePlayoffs(event) {
        const body = {
            match_mode_last32: this.state.match_mode_last32,
            match_mode_last16: this.state.match_mode_last16,
            match_mode_quarterFinals: this.state.match_mode_quarterFinals,
            match_mode_semiFinals: this.state.match_mode_semiFinals,
            match_mode_grandFinals:  this.state.match_mode_grandFinals
        }
        axios.post(`${window.location.origin}/tournaments/admin/generate/playoffs/${this.input.tournamentId}`, body)
            .then(response => {
                const tournament = response.data;
                location.href = `/tournaments/${tournament.id}`;
            }).catch(error => {
                alert("Unable to generate playoffs, see log for details");
                console.log(error);
            });
        event.preventDefault();
    }
}
