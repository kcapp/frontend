const localStorage = require('../../../../util/localstorage');

module.exports = {
    onCreate(input) {
        this.state = {
            buttonLayout: "wide",
            volume: 100
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
    },
    onSave() {
        this.state.buttonLayout = document.getElementById("buttonLayout").value;
        localStorage.set('button-layout', this.state.buttonLayout);
    },
    updateVolume(event, selected) {
        this.state.volume = selected.value;
        localStorage.set('volume', this.state.volume / 100);
    },
}
