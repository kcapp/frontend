const axios = require('axios');
const localStorage = require('../../../../util/localstorage');

module.exports = {
    onCreate(input, out) {
        this.state = {
            layouts: [ {id: "wide", name: "Wide"}, {id: "compact", name: "Compact"}, {id: "compact-large", name: "Compact (Large)"} ],
            buttonLayout: "wide",
            volume: 100,
            confirmBusts: true,
            autoFinishLegs: false,
            autoFinishTime: 10,
            remoteControl: false,
            venueId: -1,
            venues: [],
            locals: out.global.kcapp
        }
    },
    onMount() {
        const buttonLayout = localStorage.get("button-layout");
        if (buttonLayout) {
            this.state.buttonLayout = buttonLayout
        }

        const volume = localStorage.get("volume");
        if (volume) {
            this.state.volume = Math.min(Math.max(parseInt(volume * 100), 0), 100);
        }

        this.state.confirmBusts = localStorage.getBool("confirm-busts", true);
        this.state.autoFinishLegs = localStorage.getBool("auto-finish-legs", false);
        this.state.remoteControl = localStorage.getBool("remote-control", false);

        const autoFinishTime = localStorage.get("auto-finish-time");
        if (autoFinishTime !== null) {
            this.state.autoFinishTime = parseInt(autoFinishTime, 10) || 10;
        }

        const venueId = localStorage.get('venue_id');
        if (venueId !== null) {
            this.state.venueId = parseInt(venueId);
        }

        $(function() {
            $("#modal-configure-kcapp").on('shown.bs.modal', function(){
                axios.get(`${window.location.protocol}//${window.location.hostname}${this.state.locals.api_path}/venue`)
                    .then(response => {
                        this.state.venues = response.data;
                    }).catch(error => {
                        console.log('Error when getting venues ' + error);
                    });
            }.bind(this));
        }.bind(this));
    },
    updateVolume(event, selected) {
        this.state.volume = selected.value;
    },
    toggleConfirmBusts(event) {
        this.state.confirmBusts = event.target.checked;
    },
    toggleAutoFinishLegs(event) {
        this.state.autoFinishLegs = event.target.checked;
    },
    toggleRemoteControl(event) {
        this.state.remoteControl = event.target.checked;
    },
    updateAutoFinishTime(event) {
        this.state.autoFinishTime = parseInt(event.target.value, 10);
    },
    onSave() {
        this.state.buttonLayout = document.getElementById("buttonLayout").value;
        localStorage.set('button-layout', this.state.buttonLayout);

        this.state.venueId = parseInt(document.getElementById("venueSelect").value);
        if (this.state.venueId === -1) {
            localStorage.remove('venue_id');
            localStorage.set('remote-control', false);
        } else {
            localStorage.set('venue_id', this.state.venueId);
            localStorage.set('remote-control', this.state.remoteControl);
        }
        localStorage.set('confirm-busts', this.state.confirmBusts);
        localStorage.set('auto-finish-legs', this.state.autoFinishLegs);
        localStorage.set('auto-finish-time', this.state.autoFinishTime);
        localStorage.set('volume', this.state.volume / 100);
    },
}
