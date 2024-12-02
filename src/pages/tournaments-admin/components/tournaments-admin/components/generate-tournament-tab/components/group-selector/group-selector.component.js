module.exports = {
    onAddPlayer(player) {
        this.emit('add-player', player);
    },
    onRemovePlayer(player) {
        this.emit('remove-player', player);
    },
    onVenueChange(event, selected) {
        this.emit('venue-change', parseInt(event.target.value));
    },
    onRemoveGroup(event) {
        this.emit('remove-group');
    }
}