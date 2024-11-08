const localStorage = require('../../../../util/localstorage');

module.exports = {
    onCreate(input) {
        this.state = {
            layouts: [ {id: "wide", name: "Wide"}, {id: "compact", name: "Compact"}, {id: "compact-large", name: "Compact (Large)"} ],
            buttonLayout: "wide",
            volume: 100,
            confirmBusts: true,
            autoFinishLegs: false,
            autoFinishTime: 10
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

        const confirmBusts = localStorage.get("confirm-busts");
        if (confirmBusts !== null) {
            this.state.confirmBusts = confirmBusts === 'true';
        }

        const autoFinishLegs = localStorage.get("auto-finish-legs");
        if (autoFinishLegs !== null) {
            this.state.autoFinishLegs = autoFinishLegs === 'true';
        }

        const autoFinishTime = localStorage.get("auto-finish-time");
        if (autoFinishTime !== null) {
            this.state.autoFinishTime = parseInt(autoFinishTime, 10) || 10;
        }
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
    updateAutoFinishTime(event) {
        this.state.autoFinishTime = parseInt(event.target.value, 10);
    },
    onSave() {
        this.state.buttonLayout = document.getElementById("buttonLayout").value;
        localStorage.set('button-layout', this.state.buttonLayout);
        localStorage.set('confirm-busts', this.state.confirmBusts);
        localStorage.set('auto-finish-legs', this.state.autoFinishLegs);
        localStorage.set('auto-finish-time', this.state.autoFinishTime);
        localStorage.set('volume', this.state.volume / 100);
    },
}
