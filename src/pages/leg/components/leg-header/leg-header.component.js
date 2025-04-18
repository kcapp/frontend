const axios = require('axios');
const alertify = require("../../../../util/alertify");

module.exports = {
    onCreate(input) {
        this.state = {
            isOfficial: input.match.tournament_id !== null,
            buttonInputEnabled: input.buttonsEnabled,
            compactMode: false,
            allButtonsMode : false,
            keyboardMode: input.keyboard.mode
        }
    },

    onInput(input) {
        this.state.keyboardMode = input.keyboard.mode;
    },

    onMount() {
        const MobileDetect = require('mobile-detect'),
            md = new MobileDetect(window.navigator.userAgent);

        const isMobile = md.mobile();
        const isTablet = md.tablet();

        //const userAgent = navigator.userAgent.toLowerCase();
        //const isTablet = /(ipad|tablet|(android(?!.*mobile))|(windows(?!.*phone)(.*touch))|kindle|playbook|silk|(puffin(?!.*(IP|AP|WP))))/.test(userAgent);

        this.state.buttonInputEnabled = isMobile;
        this.emit('enable-button-input', this.state.buttonInputEnabled);

        this.state.compactMode = isMobile && !isTablet;
        this.emit('enable-compact-mode', this.state.compactMode);

        if (isMobile || isTablet) {
            $(function() {
                window.scrollTo(0,document.body.scrollHeight);
            });
        }
    },

    changeOrder(event) {
        // Modal is displayed, and code is handled in player-order component
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

    swapPlayers() {
        this.emit('swap-players');
    },

    cancelLeg(event) {
        alertify.confirm('Leg will be cancelled.', () => {
            axios.delete(`${window.location.origin}/legs/${this.input.leg.id}/cancel`)
                .then(response => {
                    location.href = '/matches';
                }).catch(error => {
                    alert('Unable to cancel leg. Reload and try again');
                });
        }, () => { /* NOOP */ });
    }
};
