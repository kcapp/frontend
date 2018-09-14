const io = require('socket.io-client');

exports.connect = (url) => {
    const socket = io(url);

    socket.on('connect', (data) => {
        socket.emit('join', 'Client Connecting');
    });

    socket.on('error', (data) => {
        console.log(data);
    });

    return socket;
}

exports.onScoreUpdate = (data, thiz) => {
    thiz.state.submitting = false;

    var leg = data.leg;
    // Update round number
    thiz.state.roundNumber = Math.floor(leg.visits.length / leg.players.length) + 1;

    var scorecardComponents = thiz.getComponents('players');
    for (var i = 0; i < scorecardComponents.length; i++) {
        var component = scorecardComponents[i];
        var isCurrentPlayer = component.state.playerId === leg.current_player_id;
        if (isCurrentPlayer) {
            component.reset();
        }
        component.state.isCurrentPlayer = isCurrentPlayer;
    }

    // Set updated score per player
    var players = data.players;
    for (var i = 0; i < players.length; i++) {
        var player = players[i];
        var scoreHeaderComponent = thiz.getComponent('player-' + player.player_id);
        scoreHeaderComponent.state.player = player;
        scoreHeaderComponent.state.isCurrentPlayer = player.player_id === leg.current_player_id;
    }
}