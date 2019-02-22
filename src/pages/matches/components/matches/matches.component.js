module.exports = {
    onCreate(input) {
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