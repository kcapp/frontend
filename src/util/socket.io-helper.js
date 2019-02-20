const _ = require("underscore");
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
    thiz.state.roundNumber = Math.floor(leg.visits.length / leg.players.length) + 1;

    var players = data.players;
    var playersMap = _.indexBy(players, 'player_id');

    var scorecardComponents = thiz.getComponents('players');
    for (var i = 0; i < scorecardComponents.length; i++) {
        var component = scorecardComponents[i];
        var player = playersMap[component.state.playerId]

        var isCurrentPlayer = component.state.playerId === leg.current_player_id;
        if (isCurrentPlayer) {
            component.reset();
        }
        component.state.isCurrentPlayer = isCurrentPlayer;
        component.state.player = player;

        var headerComponent = thiz.getComponent('player-' + player.player_id);
        headerComponent.state.player = player;
        headerComponent.state.currentScore = player.current_score;
        headerComponent.state.isCurrentPlayer = player.player_id === leg.current_player_id;
    }
}

exports.say = (data) => {
    // TODO add mp3 clips
    if (responsiveVoice.isPlaying()) {
        setTimeout(() => {
            responsiveVoice.speak(data.text, data.voice, data.options);
        }, 1500)
    } else {
        responsiveVoice.speak(data.text, data.voice, data.options);
    }
}