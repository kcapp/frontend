var axios = require('axios');
var _ = require('underscore');

module.exports = {
    onCreate(input) {
        this.state = {
            statistics1: input.statistics[0] ? input.statistics[0].x01 : {},
            statistics2: input.statistics[1] ? input.statistics[1].x01 : {},
            statistics3: input.statistics[2] ? input.statistics[2].x01 : {}
        }
    },
    handlePlayerChange(statistics, playerId) {
        axios.all([
            axios.get(`${window.location.protocol}//${window.location.hostname}${this.input.locals.kcapp.api_path}/player/${playerId}/statistics`)
        ]).then(axios.spread((staisticsData) => {
            this.state[statistics] = staisticsData.data.x01;
            this.setStateDirty(statistics);
        })).catch(error => {
            console.log('Error when getting comparison data ' + error);
        });
    },
    onShareButtonClick(event) {
        var playerIds = [];
        if (this.state.statistics1.player_id) {
            playerIds.push(this.state.statistics1.player_id);
        }
        if (this.state.statistics2.player_id) {
            playerIds.push(this.state.statistics2.player_id);
        }
        if (this.state.statistics3.player_id) {
            playerIds.push(this.state.statistics3.player_id);
        }
        var params = playerIds.length === 0 ? "" : "?player_id=";
        if (playerIds.length === 1) {
            params += playerIds[0];
        } else {
            params += playerIds.join("&player_id=");
        }
        location.href = location.href.split('?')[0] + params;
    }
}
