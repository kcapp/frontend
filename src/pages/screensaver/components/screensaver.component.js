module.exports = {
    onCreate(input) {
        this.state = {
            running: true
        }
    },
    onMount() {
        window.onclick = () =>{
            history.back();
        }
        setTimeout(() => {
            // Stop the screensaver after a while
            this.state.running = false;
        }, 5*60*100);
    }
}
