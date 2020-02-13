var io = require('../../../../util/socket.io-helper.js');

module.exports = {
    onCreate(input) {
    },

    onMount() {
        // Setup socket endpoints
        var socket = io.connect(window.location.origin + '/active');
        socket.on('warmup_started', (data) => {
            if (data.match.tournament_id !== null) {
                location.href = '/matches/' + data.match.id + '/preview';
            }
        });
    }
};

