var localStorageUtil = require("../../util/localstorage");

module.exports = {
    onCreate(input) {
        this.state = {
            values: input.values,
            attribute: input.attribute,
            defaultValue: input.defaultValue,
            index: input.defaultValue || null,
            enabled: input.enabled || true,
            options: input.options
        }
    },
    onMount() {
        // Read option from localStorage and set it if it exists
        this.state.index = localStorageUtil.getInt(this.state.attribute) || this.state.index;
        this.state.options[this.state.attribute] = this.state.index;
    },
    handleStateChange(event, selected) {
        this.state.index = selected.value === -1 ? null : parseInt(selected.value);
        this.state.options[this.state.attribute] = this.state.index;
        this.emit('value-changed', this.state.attribute, this.state.index);
    },
    updateOptions(values) {
        this.state.values = values;
        this.setStateDirty('values');
    }
}