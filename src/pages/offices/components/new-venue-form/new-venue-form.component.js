const axios = require('axios');

module.exports = {
    onInput(input) {
        var office = input.offices[Object.keys(input.offices)[0]];
        this.state = {
            name: undefined,
            description: undefined,
            has_dual_monitor: false,
            has_led_lights: false,
            has_wled_lights: false,
            has_smartboard: false,
            smartboard_uuid: undefined,
            smartboard_button_number: undefined,
            office_id: office ? office.id : undefined,
            isAdd: input.isAdd
        }
        if (input.venue) {
            this.state = {
                id: input.venue.id,
                office_id: input.venue.office_id,
                name: input.venue.name,
                description: input.venue.description,
                has_dual_monitor: input.venue.config.has_dual_monitor,
                has_led_lights: input.venue.config.has_led_lights,
                has_wled_lights: input.venue.config.has_wled_lights,
                has_smartboard: input.venue.config.has_smartboard,
                smartboard_uuid: input.venue.config.smartboard_uuid,
                smartboard_button_number: input.venue.config.smartboard_button_number,
                isAdd: input.isAdd
            }
        }
    },
    officeChanged(event) {
        this.state.office_id = event.target.value;
    },
    nameChange(event) {
        this.state.name = event.target.value;
    },
    descriptionChange(event) {
        this.state.description = event.target.value;
    },
    dualMonitorChange(event) {
        this.state.has_dual_monitor = event.target.checked;
    },
    ledLightsChange(event) {
        this.state.has_led_lights = event.target.checked;
    },
    wledLightsChange(event) {
        this.state.has_wled_lights = event.target.checked;
    },
    smartboardChange(event) {
        this.state.has_smartboard = event.target.checked;
    },
    smartboardUUIDChange(event) {
        this.state.smartboard_uuid = event.target.value;
    },
    smartboardButtonNumberChange(event) {
        this.state.smartboard_button_number = event.target.value;
    },
    addVenue(event) {
        if (!this.state.name) {
            alert("Name is required");
            event.preventDefault();
            return;
        }
        if (!this.state.has_smartboard) {
            this.state.smartboard_uuid = undefined;
            this.state.smartboard_button_number = undefined;
        }
        var body = {
            name: this.state.name,
            description: this.state.description,
            config: {
                has_dual_monitor: this.state.has_dual_monitor,
                has_led_lights: this.state.has_led_lights,
                has_wled_lights: this.state.has_wled_lights,
                has_smartboard: this.state.has_smartboard,
                smartboard_uuid: this.state.smartboard_uuid,
                smartboard_button_number: this.state.smartboard_button_number
            },
            office_id: this.state.office_id
        };
        if (this.state.isAdd) {
            axios.post(window.location.origin + '/venues', body)
                .then(response => {
                    location.href = 'offices';
                }).catch(error => {
                    console.log(error);
                });
        } else {
            axios.put(window.location.origin + '/venues/' + this.state.id, body)
                .then(response => {
                    location.href = 'offices';
                }).catch(error => {
                    console.log(error);
                });
        }
        event.preventDefault();
    }
}