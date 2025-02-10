const _ = require("underscore");
const moment = require('moment');
const axios = require('axios');
const alertify = require("../../../../../../util/alertify");

module.exports = {
    onCreate(input) {
        const generatedGroups = Object.values(input.groups).filter(group => group.is_generated && !group.is_playoffs);

        this.state = {
            modes: _.sortBy(input.modes, 'name'),
            office: Object.values(input.offices)[0].id,
            players: input.players,
            venues: input.venues,
            playersAvailable: input.players,
            generatedGroups: generatedGroups,
            selected: {
                group1: { group: generatedGroups[0], players: [] },
                group2: { group: generatedGroups[1], players: [] },
            },
            name: `Club Evening ${moment().format("Do MMM")}`,
            matchType: input.types[0].id,
            matchMode: input.modes[0].id,
            startingScore: 501,
            maxRounds: -1
        }
    },
    onMount() {
        this.onOfficeChange({ target: { value: this.state.office } });
    },

    onNameInput(event) {
        this.state.name = event.target.value;
    },
    onMatchTypeChange(event) {
        this.state.matchType = parseInt(event.target.value);
    },
    onMatchModeChange(event) {
        this.state.matchMode = parseInt(event.target.value);
    },
    onStartingScoreChange(event) {
        this.state.startingScore = parseInt(event.target.value);
    },
    onMaxRoundsChange(event) {
        this.state.maxRounds = parseInt(event.target.value);
    },

    onAddPlayer(group, player) {
        if (this.state.selected[group].players.length >= 8) {
            alertify.notify(`Max 8 players per group`, 'warning');
            return;
        }
        this.state.playersAvailable = _.reject(this.state.playersAvailable, (el) => el.id === player.id );
        this.setStateDirty('playersAvailable');

        this.state.selected[group].players.push(player);
        this.setStateDirty(`selected[${group}]`);
    },

    onRemovePlayer(group, player) {
        this.state.selected[group].players = _.reject(this.state.selected[group].players, (el) => el.id === player.id );
        this.setStateDirty(`selected[${group}]`);

        this.state.playersAvailable.push(player);
        this.state.playersAvailable = _.sortBy(this.state.playersAvailable, "name");
        this.setStateDirty('playersAvailable');
    },
    onVenueChange(group, venue) {
        this.state.selected[group].venueId = venue;
    },
    onAddGroup() {
        const numGroups = Object.keys(this.state.selected).length;
        if (numGroups >= 8) {
            alertify.notify(`Only 8 groups are supported`, 'warning');
            return;
        }
        if (numGroups >= 2 && numGroups <= 7) {
            const groupIndex = numGroups + 1;
            this.state.selected[`group${groupIndex}`] = { group: this.state.generatedGroups[numGroups], players: [] };
        }
        this.setStateDirty('selected');
    },
    onRemoveGroup(group) {
        while (this.state.selected[group].players.length > 0) {
            this.onRemovePlayer(group, this.state.selected[group].players[0]);
        }

        delete this.state.selected[group];
        this.setStateDirty('selected');
    },

    onOfficeChange(event) {
        this.state.office = parseInt(event.target.value);
        this.state.playersAvailable = _.reject(this.input.players, (player) => player.office_id !== this.state.office );
        this.setStateDirty('playersAvailable');

        this.state.venues = _.reject(this.input.venues, (venue) => venue.office_id != this.state.office );
        this.setStateDirty("venues");
    },
    generateTournament() {
        // Validate that group1 contains at least 2 players
        if (this.state.selected.group1.players.length < 2) {
            alert("Group 1 must contain at least 2 players");
            return;
        }
        // Validate that each group contains either no players, or at least 2 players
        for (let group in this.state.selected) {
            let players = this.state.selected[group].players;
            if (players.length !== 0 && players.length < 2) {
                alert("Groups must contain at least 2 players");
                return;
            }
        }

        const body = {
            name: this.state.name,
            starting_score: this.state.startingScore,
            max_rounds: this.state.maxRounds,
            match_type_id: this.state.matchType,
            match_mode_id: this.state.matchMode,
            office_id: this.state.office,
            group1: this.state.selected.group1,
            group2: this.state.selected.group2,
            group3: this.state.selected.group3,
            group4: this.state.selected.group4,
            group5: this.state.selected.group5,
            group6: this.state.selected.group6,
            group7: this.state.selected.group7,
            group8: this.state.selected.group8,
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