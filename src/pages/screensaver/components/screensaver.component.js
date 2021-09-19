module.exports = {
    onCreate(input) {
        this.state = {
            running: true
        }
    },
    onMount() {
        window.onclick = () =>{
            location.href = "/controller";
        }
        setTimeout(() => {
            // Stop the screensaver after about 2.5minutes
            this.state.running = false;
        }, 148000);
    }
}