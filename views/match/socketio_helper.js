var socket = null;

function getSocketIO(matchId) {
    if (socket == null) {
        socket = io(window.location.origin + '/matches/' + matchId);

        // Add handling of general events
        socket.on('connect', function (data) {
            socket.emit('join', 'Client Connecting');
        });

        socket.on('error', function (data) {
            console.log(data);
            alert('Error: ' + data.message);
        });
    }
    return socket
}