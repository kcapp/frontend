const _ = require("underscore");

module.exports = {
    onCreate(input) {
        let columns = {
            start_time: true, status: true, venue: true, office: true,
            type: true, mode: true, players: true, results: true, options: true,
            admin: false
        }
        if (input.columns) {
            columns = {
                start_time: _.contains(input.columns, 'start_time'),
                status: _.contains(input.columns, 'status'),
                venue: _.contains(input.columns, 'venue'),
                office: _.contains(input.columns, 'office'),
                type: _.contains(input.columns, 'type'),
                mode: _.contains(input.columns, 'mode'),
                players: _.contains(input.columns, 'players'),
                results: _.contains(input.columns, 'results'),
                options: _.contains(input.columns, 'options'),
                admin: _.contains(input.columns, 'admin')
            }
        }
        this.state = {
            total: input.total_pages,
            page: input.page,
            columns: columns
        }
    },
    onShowModal(matchId, modal) {
        this.emit('show-modal', matchId, modal);
    }
}
