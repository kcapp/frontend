module.exports = {
    handleClick(event, selected) {
        this.emit('click', selected);
    }
}