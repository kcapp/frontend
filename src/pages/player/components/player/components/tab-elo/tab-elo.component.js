const axios = require('axios');

module.exports = {
    onCreate(input) {
        this.state = {
            changelog: [],
            totalPages: 1,
            itemsPerPage: 15,
            chart: null
        }
    },
    onMount() {
        this.updateChangelog(0, this.state.itemsPerPage, true);

        document.write('<script type="text/javascript" src="/javascripts/jquery.twbsPagination-1.4.1.min.js"><\/script>');
        $(function () {
            this.state.pagination = $('.sync-pagination').twbsPagination({
                totalPages: this.state.totalPages,
                visiblePages: 5,
                initiateStartPageClick: false,
                hideOnlyOnePage: false,
                startPage: 1,
                cssStyle: '',
                prevText: '<span aria-hidden="true">&laquo;</span>',
                nextText: '<span aria-hidden="true">&raquo;</span>',
                onPageClick: function (event, page) {
                    this.updateChangelog(this.state.itemsPerPage * (page - 1), this.state.itemsPerPage);
                }.bind(this)
            });
        }.bind(this));

        this.state.chart = new Chart("canvas-elo-changes", {
            type: 'line',
            data: { labels: [], datasets: [
                { label: "Current", data: [], backgroundColor: this.input.player.color, borderColor: this.input.player.color, fill: false },
            ] },
            options: {
                responsive: true,
                title: { display: true, text: 'Elo Change' },
                tooltips: { mode: 'index', intersect: false, },
                hover: { mode: 'nearest', intersect: true },
                scales: {
                    x: { display: true, scaleLabel: { display: true, labelString: 'vs.' } },
                    y: { display: true, scaleLabel: { display: true, labelString: 'Elo' }, ticks: { precision: 0 } }
                },
                elements: { line: { tension: 0 } }
            }
        });
    },
    updateChangelog(start, limit, initial) {
        const base = `${window.location.protocol}//${window.location.hostname}${this.input.locals.kcapp.api_path}`;
        axios.get(`${base}/player/${this.input.player.id}/elo/${start}/${limit}`)
            .then(response => {
                const changes = response.data;

                const chart = this.state.chart;
                const current = [];
                const labels = [];
                for (let i = changes.changelog.length - 1; i >= 0 ; i--) {
                    const changelog = changes.changelog[i];
                    labels.push(this.input.players[changelog.away_player.player_id].name);
                    current.push(changelog.home_player.current_elo_new);
                }
                chart.data.labels = labels;
                chart.data.datasets[0].data = current;

                chart.update();

                this.state.changelog = changes.changelog;
                if (initial) {
                    this.state.totalPages = changes.total / limit;
                    this.state.totalPages = parseInt(this.state.totalPages <= 1 ? 1 : this.state.totalPages);
                    this.setStateDirty('changelog');
                }
            }).catch(error => {
                console.log(`Error when getting elo changelog for player ${error}`);
            });
    }
}