module.exports = {
    viewPlayer(event, element) {
        const playerId = element.attributes['data-player'].value;
        location.href = `/players/${playerId}/statistics`;
    },
    editPlayer(event, element) {
        this.emit('edit-player', element.attributes['data-player'].value);
    }
}