var _ = require("underscore");
var io = require('socket.io-client');
var alertify = require('./alertify');
var speaker = require('./speaker');
var types = require('../components/scorecard/components/match_types');

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
    console.log(data);

    var leg = data.leg;
    var globalstat = data.globalstat;

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
        component.state.players = players;

        var headerComponent = thiz.getComponent(`player-${player.player_id}`);
        headerComponent.state.player = player;
        headerComponent.state.isCurrentPlayer = player.player_id === leg.current_player_id;

        totalFishNChips += player.visit_statistics.fish_and_chips_counter;
    }

    if (thiz.state.type == types.X01) {
        if (isLastVisitFishNChips && !data.is_undo) {
            var msg = alertify.notify(getFishNChipsHTML(totalFishNChips - 1, globalFish - 1), 'fish-n-chips', 5, () => { });
            setInterval(() => { msg.setContent(getFishNChipsHTML(totalFishNChips, globalFish)); }, 1000);
        }
    } else if (thiz.state.type == types.TIC_TAC_TOE) {
        thiz.getComponent("tic-tac-toe-board").resetBoard(leg.parameters);
    }

    thiz.state.leg = leg;
    thiz.state.players = players;

    var compactComponent = thiz.getComponent("compact-input");
    if (compactComponent) {
        compactComponent.onScoreUpdate(data);
    }
}

exports.say = (data, thiz) => {
    // Check if an audio clip is currently playing, if it is we don't want to wait until it is finished, before saying anything else
    if ((thiz.state.type !== types.X01 && thiz.state.type !== types.X01HANDICAP) && data.type === 'remaining_score') {
        // Skip announcement of remaining score for non-x01 game types
        return;
    }
    const oldPlayer = thiz.state.audioAnnouncer;
    const isAudioAnnouncement = (oldPlayer.duration > 0 && !oldPlayer.paused) || (!isNaN(oldPlayer.duration) && !oldPlayer.ended && oldPlayer.paused);
    if (data.audios) {
        const audioPlayers = [ ];
        for (const file of data.audios) {
            audioPlayers.push(new Audio(file));
        }
        for (let i = 0; i < audioPlayers.length; i++) {
            const current = audioPlayers[i];
            const next = audioPlayers[i + 1];
            if (next) {
                current.addEventListener("ended", () => { next.play(); }, false);
            }
        }
        if (isAudioAnnouncement) {
            oldPlayer.addEventListener("ended", () => {
                audioPlayers[0].play();
            }, false);
        } else {
            audioPlayers[0].play();
        }
        thiz.state.audioAnnouncer = audioPlayers[audioPlayers.length - 1];
    } else {
        if (isAudioAnnouncement) {
            oldPlayer.addEventListener("ended", () => {
                speaker.speak(data);
            }, false);
        }
        else {
            speaker.speak(data);
        }
    }
}

exports.onPossibleThrow = function (data, thiz) {
    var component = thiz.findActive(thiz.getComponents('players'));
    var compactComponent = thiz.getComponent("compact-input");
    if (compactComponent) {
        compactComponent.setStateDirty("players");
    }

    if (data.origin === 'web' && data.uuid === component.state.uuid) {
        // No need to update possible throw if we just sent the throw
        return;
    }
    else if (data.origin === 'smartboard') {
        if (data.is_undo) {
            component.state.currentDart--;
        } else {
            component.state.currentDart++;
        }
    }

    var type = thiz.input.match.match_type.id;
    if (type == types.X01 || type == types.X01HANDICAP) {
        // Set current dart
        if (data.is_undo) {
            component.getDart(data.darts_thrown).reset();
        } else {
            component.setDart(data.score, data.multiplier, data.darts_thrown);
        }

        // Set total score
        component.state.totalScore += data.score * data.multiplier;

        // Update player score
        var header = thiz.getComponent(`player-${data.current_player_id}`);
        if (thiz.state.type == types.SHOOTOUT) {
            header.state.player.current_score += (data.score * data.multiplier);
        } else {
            header.state.player.current_score -= (data.score * data.multiplier);
            header.setScored();
        }
        header.setStateDirty('player');
    } else {
        if (type == types.TIC_TAC_TOE) {
            thiz.getComponent("tic-tac-toe-board").updateBoard(data.score, data.multiplier, data.is_undo);
        }

        if (data.is_undo) {
            component.removeLast(true);
        } else {
            component.setDart(data.score, data.multiplier, data.darts_thrown);
            component.confirmThrow(true);
        }
    }
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
