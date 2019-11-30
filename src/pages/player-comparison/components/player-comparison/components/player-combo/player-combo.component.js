module.exports = {
    handlePlayerChange(event, selected) {
        this.emit("player-change", parseInt(selected.value));
    }
}
