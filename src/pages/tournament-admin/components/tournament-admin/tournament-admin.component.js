var _ = require("underscore");
var moment = require('moment');
var axios = require('axios');

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
            start: moment().format("YYYY-MM-DDT09:00"),
            end: "",
            office: 1,
            groups: [{ id: 1, score: 301, mode: 1, type: 1 }],
            players: input.players,
            matches: matches
        }
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
        var clipboardData;

        e.stopPropagation();
        e.preventDefault();

        clipboardData = e.clipboardData || window.clipboardData;
        var text = clipboardData.getData('Text');

        var lines = text.split(/\n/);
        var matches = [];
        for (var i = 0; i < lines.length; i++) {
            var match = [];
            for (var j = 0; j < 5; j++) {
                match.push({ value: "", valid: false });
            }
            matches.push(match);
        }
        console.log(matches)
        for (var i = 0; i < lines.length; i++) {
            var line = lines[i];

            var fields = line.split(/,|\t/);
            for (var j = 0; j < fields.length; j++) {
                var field = fields[j];
                matches[i][j].value = field;
            }
        }
        this.state.matches = matches;
        this.setStateDirty("matches");

        this.validate();
    },
    validate() {
        this.state.shortName = this.state.shortName.substring(0, 4);

        var matches = this.state.matches;

        for (var i = 0; i < matches.length; i++) {
            var match = matches[i];

            var date = moment(match[0].value);
            if (date.isValid()) {
                match[0].valid = true;
            }

            var time = /[0-9][0-9]:[0-9][0-9]/.test(match[1].value);
            if (time) {
                match[1].valid = true;
            }

            var group = _.filter(this.input.groups, (group) => { return group.name == match[2].value; });
            if (group.length === 1) {
                match[2].id = group[0].id;
                match[2].valid = true;
            }

            var home = _.filter(this.state.players, (player) => { return player.name == match[3].value; });
            if (home.length === 1) {
                match[3].id = home[0].id;
                match[3].valid = true;
            }

            var away = _.filter(this.state.players, (player) => { return player.name == match[4].value.trim(); });
            if (away.length === 1) {
                match[4].id = away[0].id;
                match[4].valid = true;
            }
        }
        this.setStateDirty("matches");
    },
    createTournament() {
        var body = {
            name: this.state.tournamentName,
            short_name: this.state.shortName,
            start: this.state.start,
            end: this.state.end,
            office_id: this.state.office,
            groups: this.state.groups,
            matches: this.state.matches
        }
        axios.post(window.location.origin + '/tournaments/admin', body)
            .then(response => {
                location.href = window.location.origin + '/tournaments';
            }).catch(error => {
                alert("Unable to create trouanemtn. See log for details");
                console.log(error);
            });
    }
}