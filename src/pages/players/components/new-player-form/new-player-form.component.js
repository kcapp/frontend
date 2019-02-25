const axios = require('axios');

module.exports = {
    onInput(input) {
        this.state = {
            first_name: input.player.first_name,
            last_name: input.player.last_name,
            vocal_name: input.player.vocal_name,
            nickname: input.player.nickname,
            color: input.player.color,
            profile_pic_url: input.player.profile_pic_url
        }
    },
    onMount() {
        document.write('<script type="text/javascript" src="/javascripts/responsivevoice.1.5.8..js"><\/script>');
    },
    playVoice() {
        if (this.state.vocal_name) {
            responsiveVoice.speak(this.state.vocal_name, "US English Female");
        }
    },

    firstNameChange(event) {
        this.state.first_name = event.target.value;
    },
    lastNameChange(event) {
        this.state.last_name = event.target.value;
    },
    nicknameChange(event) {
        this.state.nickname = event.target.value;
    },
    vocalNameChange(event) {
        this.state.vocal_name = event.target.value;
    },
    colorChange(event) {
        console.log(event);
        this.state.color = event.target.value;
    },
    profilePicChange(event) {
        this.state.profile_pic_url = event.target.value;
    },
    addPlayer(event) {
        var player = this.state.player;
        var body = {
            first_name: this.state.first_name,
            last_name: this.state.last_name,
            nickname: this.state.nickname,
            vocal_name: this.state.vocal_name,
            color: this.state.color,
            profile_pic_url: this.state.profile_pic_url
        };
        console.log(body);
        /*axios.post(window.location.origin + '/players', body)
            .then(response => {
                location.href = 'players';
            }).catch(error => {
                console.log(error);
            });
        */
        event.preventDefault();
    }
}