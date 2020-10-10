const axios = require('axios');

module.exports = {
    onInput(input) {
        this.state = {
            name: undefined,
            is_active: true,
            is_global: false,
            isAdd: input.isAdd
        }
        if (input.office) {
            this.state = {
                id: input.office.id,
                name: input.office.name,
                is_global: input.office.is_global,
                is_active: input.office.is_active
            }
        }
    },
    nameChange(event) {
        this.state.name = event.target.value;
    },
    activeChange(event) {
        this.state.is_active = event.target.checked;
    },
    globalChange(event) {
        this.state.is_global = event.target.checked;
    },
    addOffice(event) {
        if (!this.state.name) {
            alert("Name is required");
            event.preventDefault();
            return;
        }
        var body = {
            name: this.state.name,
            is_global: this.state.is_global,
            is_active: this.state.is_active
        };
        if (this.state.isAdd) {
            axios.post(`${window.location.origin}/offices`, body)
                .then(response => {
                    location.href = 'offices';
                }).catch(error => {
                    console.log(error);
                });
        } else {
            axios.put(`${window.location.origin}/offices/${this.state.id}`, body)
                .then(response => {
                    location.href = 'offices';
                }).catch(error => {
                    console.log(error);
                });
        }
        event.preventDefault();
    }
}