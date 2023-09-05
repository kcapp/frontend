module.exports = {
    addPlayer(event, selected) {
        this.emit('add-player', selected.input.player);
    },
    removePlayer(event, selected) {
        this.emit('remove-player', selected.input.player);
    },
    removeGroup(event) {
        this.emit('remove-group');
    }
}