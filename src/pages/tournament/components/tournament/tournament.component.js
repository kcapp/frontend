const _ = require("underscore");

module.exports = {
    onCreate(input) {
        const matches = {};
        const unplayed = {};

        for (const key in input.matches) {
            const m = input.matches[key];
            matches[key] = m.filter(match => !match.is_bye);
            unplayed[key] = m.filter(match => !match.is_finished || match.is_bye);
        }
        this.state = {
            hasStatistics: !_.isEmpty(input.statistics.best_three_dart_avg),
            matches: matches,
            unplayed: unplayed
        }
    },

    onMount() {
        // TODO Do this without datatables
        document.write('<script type="text/javascript" src="/javascripts/datatables-1.10.16.min.js"><\/script>');

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
                if (window.location.hash === '#matches') {
                    $('.tournament-group-matches').click();
                } else if (window.location.hash === '#unplayed') {
                    $('.tournament-group-unplayed-matches').click();
                } else {
                    $('a[href="' + window.location.hash + '"]').click();
                }
            }
        });
    }

}