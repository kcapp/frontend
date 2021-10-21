module.exports = {
    onCreate(input) {
        this.state = {
            visits: input.visits
        }
    },
    setVisits(visits) {
        this.state.visits = visits;
        this.setStateDirty('visits');
    }
}