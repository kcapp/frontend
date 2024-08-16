const io = require(`../../../../util/socket.io-helper`);
const localStorage = require("../../../../util/localstorage");
const _ = require("underscore");
const speaker = require('../../../../util/speaker');

module.exports = {
    onCreate(input) {
        this.state = {
            players: input.players,
            smartcardReadhFnc: (data) => { },
            ttsVoice: undefined
        }
    },
    onMount() {
        const socket = io.connect(`${window.location.origin}/active`);
        socket.on('smartcard', (data) => {
            this.state.smartcardReadhFnc(data);
        });
        $('#add-player-modal').on('shown.bs.modal', function (e) {
            const comp = this.getComponent('add-player-modal');
            this.state.smartcardReadhFnc = comp.smartcardRead.bind(comp);
        }.bind(this));

        const venueId = localStorage.get('venue_id');
        if (venueId) {
            let venues = this.input.venues.filter((venue) => venue.id == venueId);
            if (venues.length > 0) {
                this.state.ttsVoice = venues[0].config.tts_voice;
            }
        }
        // Initialize voices
        speaker.loadVoices(() => {});
    },
    officeChanged(id) {
        const officeId = parseInt(id);
        if (officeId === 0) {
            this.state.players = this.input.players;
        } else {
            this.state.players = _.reject(this.input.players, (player) => {
                return player.office_id !== officeId ;
            });
        }
        this.setStateDirty("players");
    },
    addPlayer() {
        this.getComponent('add-player-modal').reset()
    },
    editPlayer(playerId) {
        const player = _.find(this.state.players, (player) => {
            return player.id === parseInt(playerId);
        });
        this.getComponent('add-player-modal').setPlayer(player);
    }
};
