module.exports = {
    onModalPressed(event) {
        this.emit('show-modal', this.input.data);
    }
}