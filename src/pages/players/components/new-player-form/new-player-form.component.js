const axios = require('axios');
var speaker = require('../../../../util/speaker');

module.exports = {
    onInput(input) {
        this.state = {
            first_name: undefined,
            last_name: undefined,
            vocal_name: undefined,
            nickname: undefined,
            slack_handle: undefined,
            color: '#dfdfdf',
            profile_pic_url: undefined,
            office_id: 1,
            isAdd: input.isAdd
        }
        if (input.player) {
            this.state = {
                id: input.player.id,
                first_name: input.player.first_name,
                last_name: input.player.last_name,
                vocal_name: input.player.vocal_name,
                nickname: input.player.nickname,
                slack_handle: input.player.slack_handle,
                color: input.player.color,
                profile_pic_url: input.player.profile_pic_url,
                office_id: input.player.office_id,
                isAdd: input.isAdd
            }
        }
    },
    playVoice() {
        if (this.state.vocal_name) {
            speaker.speak({text: this.state.vocal_name});
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
        this.state.color = event.target.value;
    },
    profilePicChange(event) {
        this.state.profile_pic_url = event.target.value;
    },
    slackHandleChange(event) {
        this.state.slack_handle = event.target.value;
    },
    officeChanged(event) {
        this.state.office_id = event.target.value;
    },
    addPlayer(event) {
        if (!this.state.first_name) {
            alert("At least first name must be specified");
            event.preventDefault();
            return;
        }
        var body = {
            first_name: this.state.first_name,
            last_name: this.state.last_name,
            nickname: this.state.nickname,
            vocal_name: this.state.vocal_name,
            slack_handle: this.state.slack_handle,
            color: this.state.color,
            profile_pic_url: this.state.profile_pic_url,
            office_id: this.state.office_id
        };
        if (this.state.isAdd) {
            axios.post(window.location.origin + '/players', body)
                .then(response => {
                    location.href = 'players';
                }).catch(error => {
                    console.log(error);
                });
        } else {
            axios.put(window.location.origin + '/players/' + this.state.id, body)
                .then(response => {
                    location.href = 'players';
                }).catch(error => {
                    console.log(error);
                });
        }
        event.preventDefault();
    }
}