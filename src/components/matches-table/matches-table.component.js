var _ = require("underscore");

module.exports = {
    onCreate(input) {
        var columns = {
            start_time: true, status: true, venue: true, type: true,
            mode: true, players: true, results: true, options: true
        }
        if (input.columns) {
            columns = {
                start_time: _.contains(input.columns, 'start_time'),
                status: _.contains(input.columns, 'status'),
                venue: _.contains(input.columns, 'venue'),
                type: _.contains(input.columns, 'type'),
                mode: _.contains(input.columns, 'mode'),
                players: _.contains(input.columns, 'players'),
                results: _.contains(input.columns, 'results'),
                options: _.contains(input.columns, 'options')
            }
        }
        this.state = {
            total: input.total_pages,
            page: input.page,
            columns: columns
        }
    }
}