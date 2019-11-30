var axios = require('axios');
var _ = require('underscore');

module.exports = {
    onCreate(input) {
        this.state = {
            statistics1: {},
            statistics2: {},
            statistics3: {}
        }
    },
    handlePlayerChange(statistics, playerId) {
        axios.all([
            axios.get(this.input.locals.kcapp.api_external + '/player/' + playerId + '/statistics')
        ]).then(axios.spread((staisticsData) => {
            this.state[statistics] = staisticsData.data;
            this.setStateDirty(statistics);
        })).catch(error => {
            console.log('Error when getting data for tournament ' + error);
        });
    }
}
