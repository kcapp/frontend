var socket = null;
var socketVenue = null;

function getLegsNamespace(leg) {
    if (socket == null && !leg.is_finished) {
        socket = io(window.location.origin + '/legs/' + leg.id);

        // Add handling of general events
        socket.on('connect', function (data) {
            socket.emit('join', 'Client Connecting');
        });

        socket.on('error', function (data) {
            logError(data);
        });
    }
    return socket;
}

function getVenueNamespace(venueId) {
    if (socketVenue == null) {
        socketVenue = io(window.location.origin + '/venue/' + venueId);

        // Add handling of general events
        socketVenue.on('connect', function (data) {
            socket.emit('join', 'Client Connecting');
        });

        socketVenue.on('error', function (data) {
            logError(data);
        });
    }
    return socketVenue;
}

function logError(data) {
    console.log(data);
    var message = data
    if (data.message) {
        message = data.message;
    }
    alert('sio error: ' + message);
}