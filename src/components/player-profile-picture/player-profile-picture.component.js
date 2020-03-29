module.exports = {
    onInput(input) {
        this.state = {
            profile_pic_url: input.player ? input.player.profile_pic_url : undefined
        }
    }
}