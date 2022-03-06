const axios = require('axios');

module.exports = {
    onInput(input) {
        this.state = {
            name: undefined,
            division: 1
        }
    },
    nameChange(event) {
        this.state.name = event.target.value;
    },
    divisionChange(event) {
        this.state.division = event.target.value;
    },
    addGroup(event) {
        if (!this.state.name) {
            alert("Name is required");
            event.preventDefault();
            return;
        }
        if (!this.state.division) {
            alert("Division is required");
            event.preventDefault();
            return;
        }
        const body = {
            name: this.state.name,
            division: this.state.division
        };
        axios.post(`${window.location.origin}/tournaments/admin/groups`, body)
            .then(response => {
                location.reload();
            }).catch(error => {
                console.log(error);
            });
        event.preventDefault();
    }
}