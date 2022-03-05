const WHITE = { color: "white", start: 0, end: 149 };
const PURPLE = { color: "purple", start: 150, end: 299 };
const YELLOW = { color: "yellow", start: 300, end: 449 };
const GREEN = { color: "green", start: 450, end: 599 };
const BLUE = { color: "blue", start: 600, end: 699 };
const RED = { color: "red", start: 700, end: 849 };
const BLACK = { color: "black", start: 850 };
const SHIRTS = [ WHITE, PURPLE, YELLOW, GREEN, BLUE, RED, BLACK ];

module.exports = {
    onInput(input) {
        const score = input.score;

        let shirt;
        if (score <= 149) {
            shirt = SHIRTS[0];
        } else if (score >= 150 && score <= 299) {
            shirt = SHIRTS[1];
        } else if (score >= 300 && score <= 449) {
            shirt = SHIRTS[2];
        } else if (score >= 450 && score <= 599) {
            shirt = SHIRTS[3];
        } else if (score >= 600 && score <= 699) {
            shirt = SHIRTS[4];
        } else if (score >= 700 && score <= 849) {
            shirt = SHIRTS[5];
        } else if (score >= 850) {
            shirt = SHIRTS[6];
        }

        this.state = {
            shirt: shirt,
            size: input.size || "small"
        }
    }
}