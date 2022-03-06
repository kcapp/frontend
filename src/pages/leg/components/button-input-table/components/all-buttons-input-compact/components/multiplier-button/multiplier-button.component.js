module.exports = {
    onClick(value, event) {
        this.emit('button-press', parseInt(value));
        event.target.blur();
    }
}