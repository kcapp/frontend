const moment = require("moment");

module.exports = {
    onCreate(input) {
        for (var i = 0; i < input.matches.length - 1; i++) {
            var match = input.matches[i];
            match.is_live = !match.is_finished && moment.duration(moment().diff(match.last_throw_time)).asMinutes().toFixed() < 2;
            match.start_time = moment(match.created_at).format('YYYY-MM-DD HH:mm');
        }
        this.state = {
            total: input.total_pages,
            page: input.page
        }
    },
    onMount() {
        // TODO Improve this to not use jquery twbsPagination
        document.write('<script type="text/javascript" src="/javascripts/jquery.twbsPagination-1.4.1.min.js"><\/script>');

        var total = this.state.total;
        var page = this.state.page;
        $(function () {
            $('.sync-pagination').twbsPagination({
                totalPages: total,
                visiblePages: 7,
                initiateStartPageClick: false,
                startPage: page,
                cssStyle: '',
                prevText: '<span aria-hidden="true">&laquo;</span>',
                nextText: '<span aria-hidden="true">&raquo;</span>',
                onPageClick: function (event, page) {
                    location.href = '/matches/page/' + page;
                }
            });
        });
    }
}