var socket = null;

function resetUIelements() {
    // Reset UI elements
    window.darts_thrown = 0;
    $('#first').text('');
    $('#first').removeAttr('data-score');
    $('#first').attr('data-multiplier', 1);
    $('#first').attr('data-checkout', 0);
    $('#second').text('');
    $('#second').removeAttr('data-score');
    $('#second').attr('data-multiplier', 1);
    $('#second').attr('data-checkout', 0);
    $('#third').text('');
    $('#third').removeAttr('data-score');
    $('#third').attr('data-multiplier', 1);
    $('#third').attr('data-checkout', 0);
    $('#submit-score-button').data('busted', 0);
    $('#submit-score-button').data('finished', 0);
}

function setupSocketIO(matchId) {
    var socket = io(window.location.protocol + '//' + window.location.host + '/matches/' + matchId);

    socket.on('connect', function (data) {
        socket.emit('join', 'Client Conneting');
    });

    socket.on('spectator_connected', function (data) {
        alertify.success('Spectator connected');
    });

    socket.on('spectator_disconnected', function (data) {
        alertify.warning('Spectator disconnected');
    });

    socket.on('connected', function (data) {
        console.log(data);
    });

    socket.on('error', function (data) {
        console.log(data);
        alert('Error: ' + data.message);
    });

    socket.on('match_finished', function (data) {
        // Forward all clients to results page when match is finished
        location.href = 'matches/' + matchId + '/leg';
    });

    socket.on('score_update', function (data) {
        $('#submit-score-button').prop('disabled', false);

        // Set the global match object
        match = data.match;
        scores = {};

        $('#round-number').text('R' + (Math.floor(match.visits.length / match.players.length) + 1));

        // Set updated score per player
        var currentPlayerId = match.current_player_id;
        var players = data.players;
        for (var i = 0; i < players.length; i++) {
            var player = players[i];
            var td = $('#player-score-' + player.player_id);
            var label = td.find('.label-player-score');
            label.text(player.current_score);

            if (player.player_id === currentPlayerId) {
                td.removeClass(1);
                td.addClass('label-active-player ' + player.modifier_class)
                label.attr('id', 'current-player');
                $('#submit-score-button').data('current-player-id', player.player_id);
            }
            else {
                td.removeClass();
                td.addClass('label-inactive-player ' + player.modifier_class);
                label.attr('id', 'player-label-' + player.player_id);
                label.removeAttr('data-current-player-id');
            }

            // TODO Fix this
            // Update the popover with First 9 and PPD
            //var popoverContent = 'First 9: ' + player.first9ppd.toFixed(2) + ', PPD: ' + player.ppd.toFixed(2);
            //label.attr('data-content', popoverContent).data('bs.popover').setContent();
        }
        resetUIelements();
    });

    this.socket = socket;
    return socket;
}