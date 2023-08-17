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
        const matchesMap = Object.values(input.matches).flat().reduce((acc, match) => {
            acc[match.id] = match;
            return acc;
        }, {});
        this.state = {
            hasStatistics: !_.isEmpty(input.statistics.best_three_dart_avg),
            matches: matches,
            matchesMap: matchesMap,
            unplayed: unplayed
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
    onShowModal(matchId) {
        this.getComponent('set-score-modal').setMatch(matchId);
    }
}