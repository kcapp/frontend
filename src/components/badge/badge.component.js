module.exports = {
    onCreate(input) {
        this.state = {
            id: input.badge.filename.substring(0, input.badge.filename.lastIndexOf('.'))
        }
    }
}