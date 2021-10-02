module.exports = {
    onCreate(input) {
        const score = input.score;
        let shirt;
        if (score <= 149) {
            shirt = "white";
        } else if (score >= 150 && score <= 299) {
            shirt = "purple";
        } else if (score >= 300 && score <= 449) {
            shirt = "yellow";
        } else if (score >= 450 && score <= 599) {
            shirt = "green";
        } else if (score >= 600 && score <= 699) {
            shirt = "blue";
        } else if (score >= 700 && score <= 849) {
            shirt = "red";
        } else if (score >= 850) {
            shirt = "black";
        }
        this.state = {
            shirt: shirt
        }
    }
}