const _ = require("underscore");
const moment = require('moment');
const axios = require('axios');
const alertify = require("../../../../../../util/alertify");

module.exports = {
    onCreate(input) {
        const matches = [];
        for (let i = 0; i < 1; i++) {
            const match = [];
            for (let j = 0; j < 5; j++) {
                match.push({ value: "", valid: false });
            }
            matches.push(match);
        }
        const preset = input.presets[0];
        const groupsAvailable = preset ? Object.values(input.groups).filter(group => group.id !== preset.group1_tournament_group.id && group.id !== preset.group2_tournament_group.id) : [];
        this.state = {
            office: Object.values(input.offices)[0].id,
            players: input.players,
            matches: matches,
            venues: input.venues,
            tournamentPreset: preset ? preset : undefined,
            playersAvailable: input.players,
            groupsAvailable: groupsAvailable,
            selected: {
                group1: [],
                group2: []
            }
        }
    },
    onMount() {
        this.onOfficeChange({ target: { value: this.state.office } });
    },

    onAddPlayer(group, player) {
        if (this.state.selected[group].length >= 8) {
            alertify.notify(`Max 8 players per group`, 'warning');
            return;
        }
        this.state.playersAvailable = _.reject(this.state.playersAvailable, (el) => el.id === player.id );
        this.setStateDirty('playersAvailable');

        this.state.selected[group].push(player);
        this.setStateDirty(`selected[${group}]`);
    },

    onRemovePlayer(group, player) {
        this.state.selected[group] = _.reject(this.state.selected[group], (el) => el.id === player.id );
        this.setStateDirty(`selected[${group}]`);

        this.state.playersAvailable.push(player);
        this.state.playersAvailable = _.sortBy(this.state.playersAvailable, "name");
        this.setStateDirty('playersAvailable');
    },
    onAddGroup() {
        const numGroups = Object.keys(this.state.selected).length;
        if (numGroups >= 4) {
            alertify.notify(`Only 4 groups are supported`, 'warning');
            return;
        }
        if (numGroups === 2) {
            this.state.selected.group3 = [];
        } else if (numGroups === 3) {
            this.state.selected.group4 = [];
        }
        this.setStateDirty('selected');
    },
    onRemoveGroup(group) {
        delete this.state.selected[group];
        this.setStateDirty('selected');
    },
    onPresetChange(event) {
        this.state.tournamentPreset = _.find(this.input.presets, (preset) => preset.id === parseInt(event.target.value));
    },
    onOfficeChange(event) {
        this.state.office = parseInt(event.target.value);
        this.state.playersAvailable = _.reject(this.input.players, (player) => player.office_id !== this.state.office );
        this.setStateDirty('playersAvailable');
    },
    generateTournament() {
        const body = {
            preset_id: this.state.tournamentPreset.id,
            office_id: this.state.office,
            group1: this.state.selected.group1,
            group2: this.state.selected.group2
        }
        axios.post(window.location.origin + '/tournaments/admin/generate', body)
            .then(response => {
                location.href = `/tournaments/${response.data.id}`;
            }).catch(error => {
                alert("Unable to generate tournament. See log for details");
                console.log(error);
            });
    }
}