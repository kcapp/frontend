const _ = require("underscore");

module.exports = {
    onCreate(input) {
        this.state = {
            hasStatistics: !_.isEmpty(input.statistics)
        }
    }
}