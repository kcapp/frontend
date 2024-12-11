const moment = require('moment');

module.exports = {
    onCreate(input) {
        const badgeMap = {};
        input.badges.map(badge => badgeMap[badge.id] = badge);
        input.player_badges.map(badge => {
            badge.acquired = true;
            badge.created_at = moment(badge.created_at).format("YYYY-MM-DD");
            if (badge.tournament_id) {
                const tournament = input.tournaments.find(tournament => tournament.id === badge.tournament_id);
                badge.tournament = tournament;
            }
            badgeMap[badge.badge.id] =  { ...badgeMap[badge.badge.id], ...badge };
        });

        const badges =  Object.values(badgeMap);
        this.state = {
            badges: badges
        }
    }
}