module.exports = {
    onMount() {
        var modal = document.getElementById('modal-confirm-checkout');
        modal.addEventListener("keypress", this.onKeyPress.bind(this), false);
    },

    onKeyPress(e) {
        if (e.key == '1') {
            this.confirmCheckout(1);
        } else if (e.key == '2') {
            this.confirmCheckout(2);
        } else if (e.key == '3') {
            this.confirmCheckout(3);
        }
        e.stopPropagation();
    },

    onConfirmCheckout(event, target) {
        var darts = parseInt(target.getAttribute('data-checkout-darts'));
        this.confirmCheckout(darts);
    },

    confirmCheckout(numDarts) {
        this.emit('confirm-checkout', numDarts);
    }
};