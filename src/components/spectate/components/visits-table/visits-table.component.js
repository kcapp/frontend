module.exports = {
    onCreate(input) {
        this.state = {
            visits: input.visits.reverse()
        }
    },
    setVisits(visits) {
        this.state.visits = visits.reverse();
        this.setStateDirty('visits');
    }
}