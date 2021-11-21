module.exports = {
    onInput(input) {
        this.state = {
            selected: input.selected
        }
    },
    comparePlayers(event) {
        let params = '?';
        for (let i = 0; i < this.state.selected.length; i++) {
            params += `player_id=${this.state.selected[i]}&`;
        }
        location.href = `/players/compare${params}`;
    },
    addPlayer(event) {
        this.emit('add-player');
    }
}