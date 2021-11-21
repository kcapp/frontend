module.exports = {
    onInput(input) {
        let profilePicUrl = input.profile_pic_url;
        let playerId = input.player_id;
        if (input.player) {
            playerId = input.player.id;
            profilePicUrl = input.player.profile_pic_url;
        }
        this.state = {
            profile_pic_url: profilePicUrl,
            player_id: playerId
        }
    }
}