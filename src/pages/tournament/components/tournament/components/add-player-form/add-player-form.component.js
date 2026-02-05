const axios = require('axios');
const _ = require('underscore');

module.exports = {
    onCreate(input) {
        const existingPlayers = Object.values(input.overview).flat().map(player => player.player_id);
        const players = _.sortBy(input.players, 'name')
            .filter(player => player.office_id === input.officeId)
            .filter(player => !existingPlayers.includes(player.id))
            .filter(player => !player.is_placeholder)
            .filter(player => !player.is_bot);

        this.state = {
            players: players,
            playerID: players.length === 0 ? -1 : players[0].id,
            groupID: input.groups[0].id
        }
    },
    onPlayerChange(event) {
        this.state.playerID = parseInt(event.target.value);
    },
    onGroupChange(event) {
        this.state.groupID = parseInt(event.target.value);
    },
    addPlayer(event) {
        if (this.state.players.length === 0) {
            return;
        }
        const body = { tournament_group_id: this.state.groupID, player_id: this.state.playerID };
        axios.post(`${window.location.origin}/tournaments/${this.input.tournamentId}/player`, body)
            .then(response => {
                location.reload();
            }).catch(error => {
                console.log(error);
            });
        event.preventDefault();
    }
}