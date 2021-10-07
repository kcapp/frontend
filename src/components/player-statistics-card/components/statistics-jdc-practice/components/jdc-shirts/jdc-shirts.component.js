module.exports = {
    onCreate(input) {
        let color;
        const score = input.score;
        if (score <= 149) {
            color = "white";
        } else if (score >= 150 && score <= 299) {
            color = "purple";
        } else if (score >= 300 && score <= 449) {
            color = "yellow";
        } else if (score >= 450 && score <= 599) {
            color = "green";
        } else if (score >= 600 && score <= 699) {
            color = "blue";
        } else if (score >= 700 && score <= 849) {
            color = "red";
        } else if (score >= 850) {
            color = "black";
        }

        this.state = {
            color: color
        }
    }
}