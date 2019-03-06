module.exports = {
    navigatePrevious() {
        this.emit("previous");
    },
    navigateNext() {
        this.emit("next");
    }
}