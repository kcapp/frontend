var socket = null;

function getSocketIO(legId) {
    if (socket == null) {
        socket = io(window.location.origin + '/legs/' + legId);

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