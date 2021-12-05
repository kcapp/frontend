const io = require(`../../../util/socket.io-helper`);
const _ = require('underscore');

module.exports = {
    onCreate() {
        this.state = {
            smartcardReadhFnc: (data) => { }
        }
    },
    onMount() {
        const socket = io.connect(`${window.location.origin}/active`);
        socket.on('smartcard', (data) => {
            this.state.smartcardReadhFnc(data);
        });
        $('#add-preset-modal').on('shown.bs.modal', function (e) {
            const comp = this.getComponent('add-preset-modal');
            this.state.smartcardReadhFnc = comp.smartcardRead.bind(comp);
        }.bind(this));
    },
    addPreset() {
        this.getComponent('add-preset-modal').reset();
    },
    editPreset(event, element) {
        const presetId = parseInt(element.attributes['data-preset-id'].value);
        const preset = _.find(this.input.presets, (preset) => {
            return preset.id === presetId;
        });
        this.getComponent('add-preset-modal').setPreset(preset);
    }
};
