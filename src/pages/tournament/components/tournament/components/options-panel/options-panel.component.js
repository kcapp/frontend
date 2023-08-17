const axios = require('axios');

module.exports = {
    generatePlayoffs(event) {
        axios.post(`${window.location.origin}/tournaments/admin/generate/playoffs/${this.input.tournament.id}`)
            .then(response => {
                const tournament = response.data;
                location.href = `/tournaments/${tournament.id}`;
            }).catch(error => {
                console.log(error);
            });
        event.preventDefault();
    }
}