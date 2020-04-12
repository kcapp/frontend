const axios = require('axios');

module.exports = {
    onCreate(input) {
        this.state = {
            buyer: -1,
            reciever: -1,
            amount: 1,
            item: 1
        }
    },
    buyerChanged(event) {
        this.state.buyer = event.target.value;
    },
    recieverChanged(event) {
        this.state.reciever = event.target.value;
    },
    itemChanged(event) {
        this.state.item = parseInt(event.target.value);
    },
    amountChanged(event) {
        this.state.amount = parseInt(event.target.value);
    },
    registerPayback(event) {
        var body = {
            player_ower_id: parseInt(this.state.buyer),
            player_owee_id: parseInt(this.state.reciever),
            amount: this.state.amount,
            owe_type: { id: this.state.item }
        }
        axios.put(window.location.origin + '/owes/payback', body)
            .then(response => {
                location.href = 'owes';
            }).catch(error => {
                console.log(error);
                var alert = $('#add-payback-failed-alert');
                alert.show();
                alert.text('Unable to add payback. ' + error.response.statusText);
            });
        event.preventDefault();
    }
}