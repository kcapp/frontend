const axios = require('axios');
const alertify = require("../../../../util/alertify");

module.exports = {
    onCreate(input) {
        this.state = {
            isOfficial: input.match.tournament_id !== null,
            buttonInputEnabled: input.buttonsEnabled,
            compactMode: false,
            allButtonsMode : false,
            keyboardMode: input.keyboard.mode,
            hasAutodarts: input.match.venue && input.match.venue.config.has_autodarts,
            autodarts: {}
        }

        if (this.state.hasAutodarts) {
            this.state.hasAutodarts = true;

            const autodartsURL = input.match.venue.config.autodarts_url;
            const raw = autodartsURL.replace(/^ws:\/\//, '');
            const [host, port] = raw.split(':');

            this.state.autodarts = {
                url: `http://${host}:${port}`,
                connected: undefined,
                status: undefined,
                running: false,
                numThrows: 0
            }
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

        if (this.state.hasAutodarts) {
            // The possible event types that the board can send.
            const EventType = {
                STARTING: "Starting",
                STARTED: "Started",
                STOPPING: "Stopping",
                STOPPED: "Stopped",
                THROW_DETECTED: "Throw detected",
                TAKEOUT_STARTED: "Takeout started",
                TAKEOUT_FINISHED: "Takeout finished",
                MANUAL_RESET: "Manual reset",
                CALIBRATION_STARTED: "Calibration started",
                CALIBRATION_FINISHED: "Calibration finished",
                CALIBRATION_FAILED: "Calibration failed",
            };

            const ws = new WebSocket(`${this.input.match.venue.config.autodarts_url}/api/events?type=state`);
            ws.onopen = () => {
                console.log("Connected to Autodarts");
                this.state.autodarts.connected = true;
                alertify.success("Connected to Autodarts");
                this.updateAutodartsStatus();
            };

            ws.onmessage = (event) => {
                const data = JSON.parse(event.data);
                if (data.type !== "state") {
                    return;
                }

                const msg = data.data;
                console.log(msg);
                this.state.autodarts.status = msg.status;
                this.state.autodarts.connected = msg.connected;
                this.state.autodarts.running = msg.running;
                this.state.autodarts.numThrows = msg.numThrows;
                if (msg.event === EventType.THROW_DETECTED && msg.throws) {
                    const segment = msg.throws[msg.throws.length - 1].segment;
                    const score = segment.multiplier === 0 ? 0 : segment.number;
                    console.log(`${msg.event} (${msg.status}): ${segment.name}`);

                    this.emit('autodarts-throw', score, segment.multiplier, 'autodarts');
                } else {
                    console.log(`${msg.event} (${msg.status})`);
                    if (msg.event === EventType.TAKEOUT_FINISHED) {
                        this.emit('autodarts-submit-throw');
                    } else if (msg.event === EventType.TAKEOUT_STARTED) {
                        // no-op
                    } else {
                        alertify.notify(`Autodarts: ${msg.event}`)
                    }
                }
                this.setStateDirty('autodarts');
            };

            ws.onerror = (error) => {
                console.log(`error: ${error.message}`);
                alertify.success(`Error from Autodarts: ${error.message}`);
            };

            ws.onclose = () => {
                this.state.autodarts.connected = false;
                console.log("Autodarts connection closed");
                alertify.error(`Autodarts connection closed`);
                this.setStateDirty('autodarts');
            };
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

    swapPlayers(event) {
        this.emit('swap-players');
        event.target.closest('button').blur();
    },

    updateAutodartsStatus() {
        axios.get(`${this.state.autodarts.url}/api/state`)
            .then((response) => {
                this.state.autodarts.connected = response.data.connected;
                this.state.autodarts.running = response.data.running;
                this.state.autodarts.status = response.data.status;
                this.setStateDirty("autodarts");
            }).catch(error => {
                console.log(error);
                alertify.error("Unable to get Autodarts status");
            });
    },

    resetAutodarts(event) {
        axios.post(`${this.state.autodarts.url}/api/reset`)
            .then((response) => {
                this.updateAutodartsStatus();
            }).catch(error => {
                console.log(error);
                alertify.error("Unable to reset Autodarts");
            });
        event.target.closest('button').blur();
    },

    startStopAutodarts() {
        const url = `${this.state.autodarts.url}/api/${this.state.autodarts.running ? 'stop' : 'start'}`;
        axios.put(url)
            .then((response) => {
                this.updateAutodartsStatus();
            }).catch(error => {
                console.log(error);
                alertify.error("Unable to start/stop Autodarts");
            });
        event.target.closest('button').blur();
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
