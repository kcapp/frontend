module.exports = {
    onCreate(input) {
        const statistics = input.statistics;
        statistics.forEach(statistic => {
            const badge = input.badges.find(badge => badge.id === statistic.badge_id);
            statistic.badge = Object.assign({}, badge);
            statistic.badge.level = statistic.level;
        });
        this.state = {
            statistics: statistics
        }
    }
}