module.exports = {
    onCreate(input) {
        const statistics = input.statistics;
        statistics.forEach(statistic => {
            const badge = input.badges.find(badge => badge.id === statistic.badge_id);
            statistic.badge = Object.assign({}, badge);
            if (badge.secret && statistic.unlocked_players < 1) {
                badge.filename = "hidden.svg";
                badge.description = "???";
                badge.unlocked = false;
            } else {
                badge.unlocked = true;
            }
            statistic.badge.level = statistic.level;
        });
        this.state = {
            statistics: statistics
        }
    }
}