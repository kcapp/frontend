module.exports = {
    onInput(input) {
        this.state = {
        }
    },
    addOffice(event) {
        this.emit('add-office');
    },
    addVenue(event) {
        this.emit('edit-venue');
    }
}