module.exports = {
    onCreate() {

    },

    onInput(input) {
        this.state = {
            selected: []
        }
    },

    comparePlayers(event) {
        console.log(event);
        var queryParameters = '?';
        for (var i = 0; i < this.state.selected.length; i++) {
            query += 'player_id=' + this.state.selected[i] + '&';
        }
        location.href = '/players/compare' + queryParameters;
    }
}