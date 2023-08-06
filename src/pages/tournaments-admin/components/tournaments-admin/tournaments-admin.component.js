const _ = require("underscore");
const moment = require('moment');
const axios = require('axios');

module.exports = {
    onCreate(input) {
        var matches = [];
        for (var i = 0; i < 1; i++) {
            var match = [];
            for (var j = 0; j < 5; j++) {
                match.push({ value: "", valid: false });
            }
            matches.push(match);
        }

        this.state = {
            tournamentName: "",
            shortName: "",
            start: moment().format("YYYY-MM-DDT16:00:00"),
            end: moment().format("YYYY-MM-DDT21:00:00"),
            office: 1,
            venue: 1,
            groups: [{ id: 1, score: 301, mode: 1, type: 1 }],
            players: input.players,
            matches: matches,
            venues: input.venues,
            tournamentPreset: 1,
            playersAvailable: input.players,
            selected: {
                group1: [],
                group2: []
            }
        }
    },
    onMount() {
        this.officeChange({ target: { value: this.state.office } });
    },

    addPlayer(group, event, selected) {
        const player = selected.input.player;

        this.state.playersAvailable = _.reject(this.state.playersAvailable, (el) => el.id === player.id );
        this.setStateDirty('playersAvailable');

        this.state.selected[group].push(player);
        this.setStateDirty(`selected[${group}]`);
    },

    removePlayer(group, event, selected) {
        const player = selected.input.player;

        this.state.selected[group] = _.reject(this.state.selected[group], (el) => el.id === player.id );
        this.setStateDirty(`selected[${group}]`);

        this.state.playersAvailable.push(player);
        this.state.playersAvailable = _.sortBy(this.state.playersAvailable, "name");
        this.setStateDirty('playersAvailable');
    },
    onPresetChange(event) {
        this.state.tournamentPreset = event.target.value;
    },

    tournamentNameChange(event) {
        this.state.tournamentName = event.target.value;
    },
    shortNameChange(event) {
        this.state.shortName = event.target.value;
    },
    startDateChange(event) {
        this.state.start = event.target.value;
    },
    endDateChange(event) {
        this.state.end = event.target.value;
    },
    officeChange(event) {
        this.state.office = parseInt(event.target.value);
        this.state.venues = _.reject(this.input.venues, (venue) => {
            return venue.office_id != this.state.office ;
        });
        this.setStateDirty("venues");
        if (this.state.venues.length > 0) {
            this.venueChange({ target: { value: this.state.venues[0].id } });
        } else {
            this.venueChange({ target: { value: -1 } });
        }
        this.state.playersAvailable = _.reject(this.input.players, (player) => player.office_id !== this.state.office );
        this.setStateDirty('playersAvailable');
    },
    venueChange(event) {
        this.state.venue = parseInt(event.target.value);
    },
    groupChange(event) {
        this.state.groups[event.target.attributes.idx.value].id = parseInt(event.target.value);
        this.setStateDirty("groups");
    },
    scoreChange(event) {
        this.state.groups[event.target.attributes.idx.value].score = parseInt(event.target.value);
        this.setStateDirty("groups");
    },
    typeChange(event) {
        this.state.groups[event.target.attributes.idx.value].type = parseInt(event.target.value);
        console.log(this.input.types)
        console.log(this.state.groups[0]);
        this.setStateDirty("groups");
    },
    modeChange(event) {
        this.state.groups[event.target.attributes.idx.value].mode = parseInt(event.target.value);
        this.setStateDirty("groups");
    },
    addGroup() {
        this.state.groups.push({ id: 1, score: 301, mode: 1, type: 1 });
        this.setStateDirty("groups");
    },
    removeGroup() {
        if (this.state.groups.length > 1) {
            this.state.groups.splice(-1, 1);
        }
        this.setStateDirty("groups");
    },
    onPaste(e) {
        let clipboardData;

        e.stopPropagation();
        e.preventDefault();

        clipboardData = e.clipboardData || window.clipboardData;
        const text = clipboardData.getData('Text');

        const lines = text.split(/\n/);
        const matches = [];
        for (let i = 0; i < lines.length; i++) {
            const match = [];
            for (let j = 0; j < 5; j++) {
                match.push({ value: "", valid: false });
            }
            matches.push(match);
        }
        console.log(matches)
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];

            const fields = line.split(/,|\t/);
            for (let j = 0; j < fields.length; j++) {
                const field = fields[j];
                matches[i][j].value = field;
            }
        }
        this.state.matches = matches;
        this.setStateDirty("matches");

        this.validate();
    },
    validate() {
        this.state.shortName = this.state.shortName.substring(0, 4);
        const matches = this.state.matches;

        for (let i = 0; i < matches.length; i++) {
            let match = matches[i];

            const date = moment(match[0].value);
            if (date.isValid()) {
                match[0].valid = true;
            }

            const time = /[0-9][0-9]:[0-9][0-9]/.test(match[1].value);
            if (time) {
                match[1].valid = true;
            }

            const group = _.filter(this.input.groups, (group) => { return group.name == match[2].value; });
            if (group.length === 1) {
                match[2].id = group[0].id;
                match[2].valid = true;
            }

            const home = _.filter(this.state.players, (player) => { return player.name == match[3].value; });
            if (home.length === 1) {
                match[3].id = home[0].id;
                match[3].valid = true;
            }

            const away = _.filter(this.state.players, (player) => { return player.name == match[4].value.trim(); });
            if (away.length === 1) {
                match[4].id = away[0].id;
                match[4].valid = true;
            }
        }
        this.setStateDirty("matches");
    },
    createTournament() {
        const body = {
            name: this.state.tournamentName,
            short_name: this.state.shortName,
            start: moment(this.state.start).format("yyyy-MM-hhTHH:mm:ssZ"),
            end: moment(this.state.end).format("yyyy-MM-hhTHH:mm:ssZ"),
            office_id: this.state.office,
            venue_id: this.state.venue,
            groups: this.state.groups,
            matches: this.state.matches
        }
        axios.post(window.location.origin + '/tournaments/admin', body)
            .then(response => {
                location.href = window.location.origin + '/tournaments';
            }).catch(error => {
                alert("Unable to create tournament. See log for details");
                console.log(error);
            });
    },
    generateTournament() {
        const body = {
            preset_id: this.state.tournamentPreset,
            office_id: this.state.office,
            group1: this.state.selected.group1,
            group2: this.state.selected.group2
        }
        axios.post(window.location.origin + '/tournaments/admin/generate', body)
            .then(response => {
                location.href = window.location.origin + '/tournaments';
            }).catch(error => {
                alert("Unable to generate tournament. See log for details");
                console.log(error);
            });
    }
}