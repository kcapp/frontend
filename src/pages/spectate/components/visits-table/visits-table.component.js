module.exports = {
    onCreate(input) {
        this.state = {
            visits: input.visits
        }
    },
    setVisits(visits) {
        this.state.visits = visits;
        this.setStateDirty('visits');
        console.log(this.state.visits);
    }
}