module.exports = {
    navigatePrevious() {
        this.emit("previous");
    },
    navigateNext() {
        this.emit("next");
    },
    onRematch() {
        this.emit("rematch");
    },
    onNextMatch() {
        this.emit("next-match");
    }
}