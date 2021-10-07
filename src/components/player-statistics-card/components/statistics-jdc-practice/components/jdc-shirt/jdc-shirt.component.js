module.exports = {
    onCreate(input) {
        this.state = {
            shirt: input.color,
            size: input.size
        }
    }
}