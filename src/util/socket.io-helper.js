var _ = require("underscore");
var io = require('socket.io-client');

exports.connect = (url) => {
    var socket = io(url);

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
    thiz.state.leg = leg;
}

exports.say = (data, thiz) => {
    // Check if an audio clip is currently playing, if it is we don't want to wait until
    // it is finished, before saying anything else
    var oldPlayer = thiz.state.audioAnnouncer;
    var isAudioAnnouncement = (oldPlayer.duration > 0 && !oldPlayer.paused);
    if (data.type === 'score' &&  ['100', '140', '180'].includes(data.text)) {
        var newPlayer = new Audio('/audio/' + data.text + '.mp3');
        if (isAudioAnnouncement) {
            oldPlayer.addEventListener("ended", () => {
                newPlayer.play();
            }, false);
        } else {
            newPlayer.play();
        }        
        thiz.state.audioAnnouncer = newPlayer;
    } else {
        if (responsiveVoice.isPlaying()) {
            setTimeout(function () {
                responsiveVoice.speak(data.text, data.voice, data.options);
            }, 1500)
        }  else if (isAudioAnnouncement) {
            oldPlayer.addEventListener("ended", () => {
                responsiveVoice.speak(data.text, data.voice, data.options);
            }, false);
        }
        else {
            responsiveVoice.speak(data.text, data.voice, data.options);
        }
    }
}