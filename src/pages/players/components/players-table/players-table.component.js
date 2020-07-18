module.exports = {
    viewPlayer(event, element) {
        var playerId = element.attributes['data-player'].value;
        location.href = '/players/' + playerId + '/statistics'
    }
}