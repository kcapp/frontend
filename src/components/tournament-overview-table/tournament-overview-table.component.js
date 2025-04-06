const _ = require("underscore");

module.exports = {
    onCreate(input) {
        const keysToSum = [
            "played", "matches_won", "matches_draw", "matches_lost",
            "legs_for", "legs_against", "legs_difference", "points",
            "scores_60s_plus", "scores_100s_plus", "scores_140s_plus",
            "scores_180s", "checkout_attempts", "darts_thrown",
            "darts_per_leg", "three_dart_avg_score", "first_nine_three_dart_avg_score",
            "accuracy_20", "accuracy_19", "accuracy_overall"
        ];

        let dplCount = 0;
        let acc20Count = 0;
        let acc19Count = 0;
        const total = _.reduce(input.overview, (totals, player) => {
            _.each(keysToSum, (key) => {
                if (player[key] !== -1) {
                    totals[key] += player[key];
                }
            });
            if (player.darts_per_leg !== -1) {
                dplCount++;
            }
            if (player.accuracy_20 !== -1) {
                acc20Count++;
            }
            if (player.accuracy_19 !== -1) {
                acc19Count++;
            }

            return totals;
        }, _.object(keysToSum, _.map(keysToSum, () => 0)));

        if (dplCount > 0) {
            total.checkout_percentage = (total.legs_for / total.checkout_attempts) * 100.0;
            total.three_dart_avg = total.three_dart_avg_score / total.darts_thrown;
            total.first_nine_three_dart_avg = total.first_nine_three_dart_avg_score / ((total.legs_for + total.legs_against) * 9);
            total.darts_per_leg = total.darts_per_leg / dplCount;
            total.accuracy_20 = total.accuracy_20 / acc20Count;
            total.accuracy_19 = total.accuracy_19 / acc19Count;
            total.accuracy_overall = total.accuracy_overall / dplCount;
        }

        this.state = {
            overview: input.overview,
            total: total
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