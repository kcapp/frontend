const axios = require('axios');
const speaker = require('../../../../util/speaker');
const alertify = require(`../../../../util/alertify`);

module.exports = {
    onCreate(input) {
        this.reset();
    },
    reset() {
        this.state = {
            id: undefined,
            first_name: undefined,
            last_name: undefined,
            vocal_name: undefined,
            nickname: undefined,
            slack_handle: undefined,
            color: '#dfdfdf',
            profile_pic_url: undefined,
            smartcard_uid: undefined,
            office_id: 1,
            isAdd: true
        }
    },
    setPlayer(player) {
        this.state.id = player.id;
        this.state.first_name = player.first_name;
        this.state.last_name = player.last_name;
        this.state.vocal_name = player.vocal_name;
        this.state.nickname = player.nickname;
        this.state.slack_handle = player.slack_handle;
        this.state.color = player.color;
        this.state.profile_pic_url = player.profile_pic_url;
        this.state.smartcard_uid = player.smartcard_uid;
        this.state.office_id = player.office_id;
        this.state.isAdd = false;
    },
    playVoice() {
        const vocalName = this.state.vocal_name || this.state.first_name;
        if (vocalName) {
            if (vocalName.endsWith(".wav")) {
                const name = this.state.first_name.toLowerCase().replace(" ", "");
                const playPromise = new Audio(`/audio/announcer/names/${name}/name_1.wav`).play();
                playPromise.then(() => { // Playback done
                    }).catch((error) => {
                        alertify.error(`No vocal name exists for ${name}`, 'error', 5);
                        speaker.speak( {text: vocalName } );
                    });
            } else {
                speaker.speak( {text: vocalName } );
            }
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
        if (this.input.player) {
            this.input.player.profile_pic_url = event.target.value;
        } else {
            this.input.player = { profile_pic_url: event.target.value };
        }
    },
    smartcardUIDChange(event) {
        this.state.smartcard_uid = event.target.value;
    },
    smartcardRead(data) {
        this.state.smartcard_uid = data.uid;
        alertify.notify(`Smartcard Scanned ${data.uid}`, 'success', 5);
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
        const body = {
            first_name: this.state.first_name,
            last_name: this.state.last_name,
            nickname: this.state.nickname,
            vocal_name: this.state.vocal_name,
            slack_handle: this.state.slack_handle,
            color: this.state.color,
            profile_pic_url: this.state.profile_pic_url,
            smartcard_uid: this.state.smartcard_uid,
            office_id: this.state.office_id
        };
        if (this.state.isAdd) {
            axios.post(`${window.location.origin}/players`, body)
                .then(response => {
                    location.href = 'players';
                }).catch(error => {
                    console.log(error);
                });
        } else {
            axios.put(`${window.location.origin}/players/${this.state.id}`, body)
                .then(response => {
                    location.href = 'players';
                }).catch(error => {
                    console.log(error);
                });
        }
        event.preventDefault();
    }
}