const _ = require("underscore");

module.exports = {
    onCreate(input) {
        const matches = {};
        const unplayed = {};

        for (const key in input.matches) {
            const m = input.matches[key];
            matches[key] = m.filter(match => !match.is_bye);
            unplayed[key] = m.filter(match => !match.is_finished);
        }
        const groups = new Set();
        const overview = input.overview;
        for (const key in overview) {
            const g = overview[key];
            groups.add(g[0].tournament_group);
            // Filter out "placeholder"-players without any name
            overview[key] = _.filter(g, player => input.players[player.player_id].name !== "")
            unplayed[key] = _.sortBy(unplayed[key], "created_at");
        }
        const matchesMap = Object.values(input.matches).flat().reduce((acc, match) => {
            acc[match.id] = match;
            return acc;
        }, {});
        // Add all playoffs matches
        if (input.playoffsMatches) {
            Object.assign(matchesMap, Object.values(input.playoffsMatches).flat().reduce((acc, match) => {
                acc[match.id] = match;
                return acc;
            }, {}));
        }

        this.state = {
            hasStatistics: !_.isEmpty(input.statistics.best_three_dart_avg),
            matches: matches,
            matchesMap: matchesMap,
            unplayed: unplayed,
            groups: Array.from(groups),
            overview: overview,
            unq_statistics: {},
            statistics: input.statistics,
            showAllStats: true,
            showPerLeg: true
        }
        if (this.state.hasStatistics) {
            // Create unique statistics
            if (input.statistics.best_301_darts_thrown) {
                this.state.unq_statistics.best_301_darts_thrown  = _.uniq(input.statistics.best_301_darts_thrown, false, item => item.player_id);
            }
            if (input.statistics.best_501_darts_thrown) {
                this.state.unq_statistics.best_501_darts_thrown  = _.uniq(input.statistics.best_501_darts_thrown, false, item => item.player_id);
            }
            this.state.unq_statistics.best_first_nine_avg    = _.uniq(input.statistics.best_first_nine_avg, false, item => item.player_id);
            this.state.unq_statistics.best_three_dart_avg    = _.uniq(input.statistics.best_three_dart_avg, false, item => item.player_id);
            this.state.unq_statistics.checkout_highest       = _.uniq(input.statistics.checkout_highest, false, item => item.player_id);
        }
    },

    onMount() {
        // TODO Do this without datatables
        document.write('<script type="text/javascript" src="/javascripts/datatables-1.10.16.min.js"><\/script>');
        document.write(`<script>
            // Handle clicks from within the SVG
            function handleClick(matchId) {
                $('#set-score-modal').data('matchId', matchId);
                $('#set-score-modal').modal('toggle');
            }
        </script>`)

        $(function () {
            $('.table-matches-list').DataTable({
                searching: false, bInfo: false, bLengthChange: false,
                pageLength: 15,
                order: [[0, 'asc']],
                bAutoWidth: false,
                oLanguage: {
                    sEmptyTable: "No unplayed matches!"
                }
            });
            if (window.location.hash != "") {
                const tabId = window.location.hash;
                if (tabId === '#matches') {
                    $('.tournament-group-matches').click();
                } else if (tabId === '#unplayed') {
                    $('.tournament-group-unplayed-matches').click();
                } else {
                    $(`a[href="${tabId}"]`).click();
                }
            }
        });
    },
    onShowModal(matchId, modal) {
        this.getComponent(modal).setMatch(matchId);
    },
    onUpdatePredictions(groupId, overview) {
        const comp = this.getComponent(`predictor-overview-${groupId}`);
        comp.updateStandings(overview);
    },
    onToggleStats(value, event) {
        this.state.showAllStats = value;
        this.state.statistics = value ? this.input.statistics : this.state.unq_statistics;
        this.setStateDirty("statistics");
    },
    onTogglePerLeg(value, event) {
        this.state.showPerLeg = value;
    }
}