module.exports = {
    onCreate(input) {
        var overview = [];
        for (var groupId in input.overview) {
            var group = input.overview[groupId];
            for (var i = 0; i < group.length; i++) {
                var player = group[i];
                if (player.player_id === input.player.id) {
                    overview.push(player);
                    break;
                }
            }
        }
        this.state = {
            overview: overview
        }
    }
}