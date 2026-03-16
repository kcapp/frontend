const localStorage = require('../../util/localstorage');

module.exports = {
    onCreate(input) {
        this.state = {
            homePage: "/",
            isController: false,
            isMememode: false
        }
    },
    onMount() {
        if (localStorage.get('controller')) {
            this.state.homePage = "/controller";
            this.state.isController = true;
        }
    }
}
