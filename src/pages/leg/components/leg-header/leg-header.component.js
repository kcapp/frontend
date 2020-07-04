var axios = require('axios');
var alertify = require("../../../../util/alertify");
var types = require("../../../../components/scorecard/components/match_types");

module.exports = {
    onCreate(input) {
        this.state = {
            leg: input.leg,
            isOfficial: input.match.tournament_id !== null,
            streamEnabled: false,
            buttonInputEnabled: input.buttonsEnabled,
            compactMode: input.compactMode,
            allButtonsMode : false
        }
    },

    onMount() {
        var MobileDetect = require('mobile-detect'),
        md = new MobileDetect(window.navigator.userAgent);

        var isMobile = md.mobile();
        var isTablet = md.tablet();

        this.state.buttonInputEnabled = isMobile;
        this.emit('enable-button-input', this.state.buttonInputEnabled);

        this.state.compactMode = isMobile && !isTablet;
        this.emit('enable-compact-mode', this.state.compactMode);
    },

    changeOrder(event) {
        // Modal is displayed, and code is handled in player-order component
    },

    enableBoardStream(id, event) {
        var data = {
            board: id,
            enabled: !this.state.streamEnabled
        };
        this.emit('enable-stream', data);
        this.state.streamEnabled = !this.state.streamEnabled;
    },

    enableButtonInput() {
        this.state.buttonInputEnabled = !this.state.buttonInputEnabled;
        this.emit('enable-button-input', this.state.buttonInputEnabled)
        if (!this.state.buttonInputEnabled) {
            this.state.compactMode = false;
        }
    },

    enableCompactMode() {
        this.state.compactMode = !this.state.compactMode;
        this.emit('enable-compact-mode', this.state.compactMode)
    },

    enableAllButtonsMode() {
        this.state.allButtonsMode = !this.state.allButtonsMode;
        this.emit('enable-all-buttons-mode', this.state.allButtonsMode)
    },

    cancelLeg(event) {
        alertify.confirm('Leg will be cancelled.', () => {
            axios.delete(window.location.origin + '/legs/' + this.state.leg.id + '/cancel')
                .then(response => {
                    location.href = '/matches';
                }).catch(error => {
                    alert('Unable to cancel leg. Reload and try again');
                });
        }, () => { /* NOOP */ });
    }
};