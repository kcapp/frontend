var _ = require("underscore");
var moment = require('moment');

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
            groups: input.groups,
            players: input.players,
            rows: rows
        }
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
            row[0].valid = date.isValid();

            var time = /[0-9][0-9]:[0-9][0-9]/.test(row[1].value);
            row[1].valid = time;

            var group = _.filter(this.state.groups, (group) => { return group.name == row[2].value; });
            row[2].valid = group.length === 1;

            var home = _.filter(this.state.players, (player) => { return player.name == row[3].value; });
            row[3].valid = home.length === 1;

            var away = _.filter(this.state.players, (player) => { return player.name == row[4].value.trim(); });
            row[4].valid = away.length === 1;
        }
        console.log(rows);
        this.setStateDirty("rows");
    }
}