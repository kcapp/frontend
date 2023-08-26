module.exports = {
    onCreate(input) {
        this.state = { 
            id: input.image.substring(input.image.lastIndexOf('/') + 1, input.image.lastIndexOf('.'))
        }
    }
}