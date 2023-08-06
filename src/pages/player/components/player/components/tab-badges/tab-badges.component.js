module.exports = {
    onCreate(input) {
        const badgeMap = {};
        input.badges.map(badge => badgeMap[badge.id] = badge);
        input.player_badges.map(badge => badgeMap[badge.badge.id].aquired = true);

        const badges =  Object.values(badgeMap);
        badges.pop();
        this.state = {
            badges: badges
        }
    }
}