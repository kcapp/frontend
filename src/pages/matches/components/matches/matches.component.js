module.exports = {
    onMount() {
        document.write('<script type="text/javascript" src="/javascripts/jquery.twbsPagination-1.4.1.min.js"><\/script>');

        var total = this.input.total_pages;
        var currentPage = parseInt(this.input.page_num);
        $(function () {
            $('.sync-pagination').twbsPagination({
                totalPages: total,
                visiblePages: 5,
                initiateStartPageClick: false,
                startPage: currentPage,
                cssStyle: '',
                prevText: '<span aria-hidden="true">&laquo;</span>',
                nextText: '<span aria-hidden="true">&raquo;</span>',
                onPageClick: function (event, page) {
                    location.href = `/matches/page/${page}`;
                }
            });
        });
    }
}