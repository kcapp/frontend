module.exports = {
    onInput(input) {
        var text = "";
        if (input.dart) {
            if (input.dart.score > 0) {
                if (input.dart.multiplier === 3) {
                    text = "T-";
                } else if (input.dart.multiplier === 2) {
                    text = "D-";
                }
                text += input.dart.score;
            } else if (input.dart.score === 0) {
                text = "Miss";
            }
        }
        this.state = {
            text: text
        }
    }
};