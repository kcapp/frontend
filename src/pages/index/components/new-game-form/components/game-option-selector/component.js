const localStorageUtil = require("../../../../../../util/localStorage");

module.exports = {
    onCreate(input) {
        this.state = {
            attribute: input.attribute,
            defaultValue: input.defaultValue,
            index: input.defaultValue || null,
            enabled: true,
            options: input.options
        }
    },
    onMount() {
        // Read option from localStorage and set it if it exists
        this.state.index = localStorageUtil.getInt(this.state.attribute) || this.state.index;
    },
    handleStateChange(event, selected) {
        this.state.index = selected.value === -1 ? null : parseInt(selected.value);
        this.state.options[this.state.attribute] = this.state.index;
        console.log(this.state.options[this.state.attribute]);
    }
}