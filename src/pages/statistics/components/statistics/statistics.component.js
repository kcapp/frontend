var _ = require("underscore");
var moment = require("moment");
var axios = require('axios');
var types = require('../../../../components/scorecard/components/match_types');
var GLOBAL = 0;

module.exports = {
    onCreate(input) {
        input.checkout_statistics = _.reject(input.checkout_statistics, (stats) => {
            return input.players[stats.player_id].is_bot ;
        });

        this.state = {
            type: types.X01,
            officeId: 0,
            statistics: input.x01,
            all: input.x01,
            checkout_statistics: input.checkout_statistics,
            from: input.from,
            to: input.to,
            GLOBAL: 0
        }
    },
    navigatePrevious() {
        var from = moment(this.state.from).isoWeekday(-6).format('YYYY-MM-DD');
        var to = this.state.from;
        window.location.href = '/statistics/' + from + '/' + to;
    },
    navigateNext() {
        var from = this.state.to;
        var to = moment(this.state.to).isoWeekday(8).format('YYYY-MM-DD');
        var nextMonday = moment().isoWeekday(8).format('YYYY-MM-DD');
        if (to <= nextMonday) {
            window.location.href = '/statistics/' + from + '/' + to;
        }
    },
    officeChanged(officeId) {
        if (this.state.type == this.state.GLOBAL) {
            this.state.statistics = this.state.all[officeId] ? this.state.all[officeId] : {};
        } else {
            if (officeId == 0) {
                this.state.statistics = this.state.all;
                this.state.checkout_statistics = this.input.checkout_statistics;
            } else {
                this.state.statistics = _.reject(this.state.all, (stats) => {
                    return stats.office_id != officeId ;
                });
                this.state.checkout_statistics = _.reject(this.input.checkout_statistics, (stats) => {
                    return stats.office_id != officeId ;
                });
            }
        }
        this.state.officeId = officeId;
        this.setStateDirty("statistics");
    },
    typeChanged(typeId) {
        if (typeId == GLOBAL) {
            axios.get(`${window.location.protocol}//${window.location.hostname}${this.input.locals.kcapp.api_path}/statistics/global`)
                .then(response => {
                    this.state.statistics = response.data;
                    this.state.all = this.state.statistics;
                    this.setStateDirty('statistics');

                    this.state.type = typeId;
                    this.officeChanged(this.state.officeId);
                }).catch(error => {
                    console.log('Error when getting statistics data ' + error);
                });
        } else {
            axios.get(`${window.location.protocol}//${window.location.hostname}${this.input.locals.kcapp.api_path}/statistics/${typeId}/${this.state.from}/${this.state.to.split(' ')[0]}`)
                .then(response => {
                    this.state.statistics = response.data;
                    this.state.all = this.state.statistics;
                    this.setStateDirty('statistics');

                    this.state.type = typeId;
                    this.officeChanged(this.state.officeId);
                }).catch(error => {
                    console.log('Error when getting statistics data ' + error);
                });
        }
    }
}