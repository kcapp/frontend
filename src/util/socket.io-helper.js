const _ = require("underscore");
const io = require('socket.io-client');
const alertify = require('./alertify');
const speaker = require('./speaker');
const types = require('../components/scorecard/components/match_types');

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
    console.log(data);

    const leg = data.leg;
    const globalstat = data.globalstat;

    const players = data.players;
    const playersMap = _.indexBy(players, 'player_id');

    const scorecardComponents = thiz.getComponents('players');

    let isLastVisitFishNChips = false;
    let totalFishNChips = 0;
    const globalFish = globalstat ? globalstat.fish_n_chips : 0;
    const currentPlayerIdx = _.findIndex(scorecardComponents, (component) => component.state.playerId === leg.current_player_id);
    for (let i = 0; i < scorecardComponents.length; i++) {
        const component = scorecardComponents[i];
        const player = playersMap[component.state.playerId]

        const isCurrentPlayer = component.state.playerId === leg.current_player_id;
        if (isCurrentPlayer) {
            isLastVisitFishNChips = players[i === 0 ? players.length - 1 : i - 1].modifiers.is_fish_and_chips;
            component.reset();
            component.state.jdcDart = null;
        } else {
            if (currentPlayerIdx <= i) {
                component.state.jdcDart = null;
            }
        }
        component.state.isCurrentPlayer = isCurrentPlayer;
        component.state.player = player;
        component.state.players = players;

        const headerComponent = thiz.getComponent(`player-${player.player_id}`);
        headerComponent.state.player = player;
        headerComponent.state.isCurrentPlayer = player.player_id === leg.current_player_id;

        totalFishNChips += player.visit_statistics.fish_and_chips_counter;
    }

    if (thiz.state.matchType == types.X01) {
        if (isLastVisitFishNChips && !data.is_undo) {
            var msg = alertify.notify(getFishNChipsHTML(totalFishNChips - 1, globalFish - 1), 'fish-n-chips', 5, () => { });
            setInterval(() => { msg.setContent(getFishNChipsHTML(totalFishNChips, globalFish)); }, 1000);
        }
    } else if (thiz.state.matchType == types.TIC_TAC_TOE) {
        thiz.getComponent("tic-tac-toe-board").resetBoard(leg.parameters);
    }

    thiz.state.leg = leg;
    thiz.state.players = players;

    const compactComponent = thiz.getComponent("compact-input");
    if (compactComponent) {
        compactComponent.onScoreUpdate(data);
    }
}

exports.say = (data, thiz) => {
    // Check if an audio clip is currently playing, if it is we don't want to wait until it is finished, before saying anything else
    if ((thiz.state.matchType !== types.X01 && thiz.state.matchType !== types.X01HANDICAP) && data.matchType === 'remaining_score') {
        // Skip announcement of remaining score for non-x01 game types
        return;
    }
    if (thiz.state.matchType === types.CRICKET && data.matchType === 'score' && data.text === "0") {
        // Skip announcment of 0 in Cricket
        return;
    }

    const oldPlayer = thiz.state.audioAnnouncer;
    const isAudioAnnouncement = (oldPlayer.duration > 0 && !oldPlayer.paused) || (!isNaN(oldPlayer.duration) && !oldPlayer.ended && oldPlayer.paused);
    if (data.audios) {
        const audioPlayers = [ ];
        for (const file of data.audios) {
            audioPlayers.push(file.file ? new Audio(file.file) : speaker.getUtterance(file));
        }

        for (let i = 0; i < audioPlayers.length; i++) {
            const current = audioPlayers[i];
            const next = audioPlayers[i + 1];
            if (next) {
                current.addEventListener("ended", () => {
                    next.play();
                }, false);
                current.onend = () => {
                    next.play();
                };
            } else {
                current.addEventListener("ended", () => {
                    thiz.state.socket.emit("speak_finish");
                }, false);
                current.onend = () => {
                    thiz.state.socket.emit("speak_finish");
                };
            }
        }

        if (isAudioAnnouncement) {
            oldPlayer.addEventListener("ended", () => {
                audioPlayers[0].play();
            });
        } else {
            audioPlayers[0].play();
        }
        thiz.state.audioAnnouncer = audioPlayers[audioPlayers.length - 1];
    } else {
        if (isAudioAnnouncement) {
            oldPlayer.addEventListener("ended", () => {
                speaker.speak(data, () => {
                    thiz.state.socket.emit("speak_finish");
                });
            }, false);
        }
        else {
            speaker.speak(data, () => {
                thiz.state.socket.emit("speak_finish");
            });
        }
    }
}

exports.onPossibleThrow = function (data, thiz) {
    const component = thiz.findActive(thiz.getComponents('players'));
    const compactComponent = thiz.getComponent("compact-input");
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

    const type = thiz.input.match.match_type.id;
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
        const header = thiz.getComponent(`player-${data.current_player_id}`);
        if (thiz.state.matchType == types.SHOOTOUT) {
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
    } else if (data.type == 'match_start') {
        // No need to announce anything
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
