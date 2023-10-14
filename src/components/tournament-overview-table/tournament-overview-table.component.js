const _ = require("underscore");

module.exports = {
    onCreate(input) {
        this.state = {
            overview: input.overview,
            hasStatistics: !_.isEmpty(input.statistics)
        }
    },
    onMount() {
        $(function() {
            $('[data-toggle="tooltip"]').tooltip();
          });
    },
    updateStandings(overview) {
        this.state.overview = _.sortBy(_.sortBy(overview, (standing) => standing.legs_difference), 'points').reverse();
        this.state.overview = this.state.overview.map((standing, idx) => {
            // Recalculate ranks
            standing.rank = idx+1;
            return standing;
        });
        this.setStateDirty("overview");
    }
}