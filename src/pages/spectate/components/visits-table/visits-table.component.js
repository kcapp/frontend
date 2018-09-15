module.exports = {
    onCreate(input) {
        this.state = {
            visits: input.visits
        }
        console.log(this.state.visits);
    },
    onMount() {
        //this.state.visits = this.state.visits.reverse();
        //this.setStateDirty('visits');
    }
}