var _ = require("underscore");
var io = require('socket.io-client');
var alertify = require('./alertify');
var speaker = require('./speaker');

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
    var globalstat = data.globalstat;
    thiz.state.roundNumber = Math.floor(leg.visits.length / leg.players.length) + 1;

    var players = data.players;
    var playersMap = _.indexBy(players, 'player_id');

    var scorecardComponents = thiz.getComponents('players');

    var isLastVisitFishNChips = false;
    var totalFishNChips = 0;
    var globalFish = globalstat ? globalstat.fish_n_chips : 0;
    for (var i = 0; i < scorecardComponents.length; i++) {
        var component = scorecardComponents[i];
        var player = playersMap[component.state.playerId]

        var isCurrentPlayer = component.state.playerId === leg.current_player_id;
        if (isCurrentPlayer) {
            isLastVisitFishNChips = players[i === 0 ? players.length - 1 : i - 1].modifiers.is_fish_and_chips;
            component.reset();
        }
        component.state.isCurrentPlayer = isCurrentPlayer;
        component.state.player = player;

        var headerComponent = thiz.getComponent('player-' + player.player_id);
        headerComponent.state.player = player;
        headerComponent.state.currentScore = player.current_score;
        headerComponent.state.isCurrentPlayer = player.player_id === leg.current_player_id;

        totalFishNChips += player.visit_statistics.fish_and_chips_counter;
    }
    if (isLastVisitFishNChips && !data.is_undo) {
        var msg = alertify.notify(getFishNChipsHTML(totalFishNChips - 1, globalFish - 1), 'fish-n-chips', 5, () => { });
        setInterval(() => { msg.setContent(getFishNChipsHTML(totalFishNChips, globalFish)); }, 1000);
    }
    thiz.state.leg = leg;
}

exports.say = (data, thiz) => {
    // Check if an audio clip is currently playing, if it is we don't want to wait until
    // it is finished, before saying anything else
    console.log(data);
    var oldPlayer = thiz.state.audioAnnouncer;
    var isAudioAnnouncement = (oldPlayer.duration > 0 && !oldPlayer.paused);
    if (data.type === 'score' && ['100', '140', '180'].includes(data.text)) {
        var newPlayer = new Audio('/audio/' + data.text + '.mp3');
        if (isAudioAnnouncement) {
            oldPlayer.addEventListener("ended", () => { newPlayer.play(); }, false);
        } else {
            newPlayer.play();
        }
        thiz.state.audioAnnouncer = newPlayer;
    } else {
        if (isAudioAnnouncement) {
            oldPlayer.addEventListener("ended", () => { speaker.speak(data); }, false);
        }
        else {
            speaker.speak(data);
        }
    }
}

exports.onPossibleThrow = function (data, thiz) {
    if (data.origin === 'web') {
        // No need to update possible throw if we just sent the throw
        return;
    }
    console.log(this.state);
    console.log(thiz.state);
    var component = thiz.findActive(thiz.getComponents('players'));

    // Set current dart
    if (data.is_undo) {
        component.getDart(data.darts_thrown).reset();
        component.state.currentDart--;
    } else {
        component.setDart(data.score, data.multiplier, data.darts_thrown);
        component.state.currentDart++;
    }
    // Set total score
    component.state.totalScore += data.score * data.multiplier;

    // Update player score
    var header = thiz.getComponent('player-' + data.current_player_id);
    header.state.currentScore -= (data.score * data.multiplier)
}

exports.onAnnounce = function (data) {
    if (data.type == 'success') {
        alertify.success(data.message);
    } else if (data.type == 'notify') {
        alertify.notify(data.message);
    } else if (data.type == 'error') {
        alertify.error(data.message);
    } else if (data.type == 'confirm_checkout') {
        $("#modal-confirm-checkout").modal();
    } else {
        alertify.notify(data.message);
    }
}

function getFishNChipsHTML(countLeg, countGlobal) {
    return `
        <h4>Fish & Chips Count<h4>
        <h5>Leg</h5>
        <h1>${countLeg}</h1>
        <h5>Globally</h5>
        <h2>${countGlobal}</h2>`;
}
