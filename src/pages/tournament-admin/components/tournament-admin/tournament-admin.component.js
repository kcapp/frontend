var _ = require("underscore");
var moment = require('moment');
var axios = require('axios');

module.exports = {
    onCreate(input) {
        var rows = [];
        for (var i = 0; i < 1; i++) {
            var row = [];
            for (var j = 0; j < 5; j++) {
                row.push({ value: "", valid: false });
            }
            rows.push(row);
        }

        this.state = {
            tournamentName: "",
            start: "",
            end: "",
            groups: input.groups,
            players: input.players,
            rows: rows
        }
    },
    tournamentNameChange(event) {
        this.state.tournamentName = event.target.value;
    },
    startDateChange(event) {
        this.state.start = event.target.value;
    },
    endDateChange(event) {
        this.state.end = event.target.value;
    },
    onPaste(e) {
        var clipboardData;

        e.stopPropagation();
        e.preventDefault();

        clipboardData = e.clipboardData || window.clipboardData;
        var text = clipboardData.getData('Text');

        var lines = text.split(/\n/);
        var rows = [];
        for (var i = 0; i < lines.length; i++) {
            var row = [];
            for (var j = 0; j < 5; j++) {
                row.push({ value: "", valid: false });
            }
            rows.push(row);
        }
        console.log(rows)
        for (var i = 0; i < lines.length; i++) {
            var line = lines[i];

            var fields = line.split(/,|\t/);
            for (var j = 0; j < fields.length; j++) {
                var field = fields[j];
                rows[i][j].value = field;
            }
        }
        this.state.rows = rows;
        this.setStateDirty("rows");

        this.validate();
    },
    validate() {
        var rows = this.state.rows;

        for (var i = 0; i < rows.length; i++) {
            var row = rows[i];

            var date = moment(row[0].value);
            if (date.isValid()) {
                row[0].valid = true;
            }

            var time = /[0-9][0-9]:[0-9][0-9]/.test(row[1].value);
            if (time) {
                row[1].valid = true;
            }

            var group = _.filter(this.state.groups, (group) => { return group.name == row[2].value; });
            if (group.length === 1) {
                row[2].id = group[0].id;
                row[2].valid = true;
            }

            var home = _.filter(this.state.players, (player) => { return player.name == row[3].value; });
            if (home.length === 1) {
                row[3].id = home[0].id;
                row[3].valid = true;
            }

            var away = _.filter(this.state.players, (player) => { return player.name == row[4].value.trim(); });
            if (away.length === 1) {
                row[4].id = away[0].id;
                row[4].valid = true;
            }
        }
        console.log(rows);
        this.setStateDirty("rows");
    },
    createTournament() {
        var body = {
            name: this.state.tournamentName,
            start: this.state.start,
            end: this.state.end,
            matches: this.state.rows
        }
        console.log(body);
        axios.post(window.location.origin + '/tournaments/admin', body)
            .then(response => {
                location.href = window.location.origin + '/tournaments';
            }).catch(error => {
                console.log(error);
            });
    }
}