const axios = require('axios');
const alertify = require(`../../../../util/alertify`);

module.exports = {
    onCreate(input) {
        this.input = input;
        this.reset();
    },
    reset() {
        this.state = {
            id: undefined,
            name: undefined,
            match_type_id: this.input.match_types[0].id,
            match_mode_id: this.input.match_modes[0].id,
            starting_score: 301,
            smartcard_uid: undefined,
            description: undefined,
            isAdd: true
        }
    },
    setPreset(preset) {
        this.state.id = preset.id;
        this.state.name = preset.name;
        this.state.match_type_id = preset.match_type.id;
        this.state.match_mode_id = preset.match_mode.id;
        this.state.starting_score = preset.starting_score;
        this.state.smartcard_uid = preset.smartcard_uid;
        this.state.description = preset.description;
        this.state.isAdd = false;
    },
    valueChanged(value, event) {
        this.state[value] = event.target.value;
    },
    smartcardRead(data) {
        this.state.smartcard_uid = data.uid;
        alertify.notify(`Smartcard Scanned ${data.uid}`, 'success', 5);
    },
    addPreset(event) {
        if (!this.state.name) {
            alert("At name must be specified");
            event.preventDefault();
            return;
        }
        const body = {
            id: this.state.id,
            name: this.state.name,
            match_type_id: parseInt(this.state.match_type_id),
            match_mode_id: parseInt(this.state.match_mode_id),
            starting_score: this.state.starting_score,
            smartcard_uid: this.state.smartcard_uid,
            description: this.state.description
        };
        if (this.state.isAdd) {
            axios.post(`${window.location.origin}/presets`, body)
                .then(response => {
                    location.href = 'presets';
                }).catch(error => {
                    console.log(error);
                });
        } else {
            axios.put(`${window.location.origin}/presets/${this.state.id}`, body)
                .then(response => {
                    location.href = 'presets';
                }).catch(error => {
                    console.log(error);
                });
        }
        event.preventDefault();
    }
}