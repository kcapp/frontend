const localStorage = require('../../../../util/localstorage');

module.exports = {
    onCreate(input) {
        this.state = {
            buttonLayout: "wide"
        }
    },
    onMount() {
        const buttonLayout = localStorage.get("button-layout");
        if (buttonLayout) {
            this.state.buttonLayout = buttonLayout
        }
    },
    onSave() {
        this.state.buttonLayout = document.getElementById("buttonLayout").value;
        localStorage.set('button-layout', this.state.buttonLayout);
    },
}
