const _ = require("underscore");

module.exports = {
    onCreate() {

    },
    onInput(input) {
        var roundNumber = Math.floor(input.leg.visits.length / input.leg.players.length) + 1;
        var matchName = input.match.match_mode.short_name;
        this.state = {
            roundNumber: roundNumber,
            matchName: matchName
        }
    },
    onMount() {
        document.addEventListener("keydown", this.onKeyDown.bind(this), false);
        document.addEventListener("keypress", this.onKeyPress.bind(this), false);
    },
    onKeyDown(e) {
        if (e.key === 'Backspace') {
            var component = this.findActive(this.getComponents('players'));

            component.removeLast();
            e.preventDefault();
        }
        return;
    },

    onKeyPress(e) {
        var component = this.findActive(this.getComponents('players'));

        var text = '';
        var currentValue = component.getCurrentValue();
        var currentMultiplier = component.getCurrentMultiplier();
        switch (e.key) {
            case 'Enter':
                /*if (disableEnter) {
                    disableEnter = false;
                    return;
                }
                if (currentDart === 4) {
                    $('#submit-score-button').trigger('click');
                }
                else {
                    var scoreNumeric = 0;
                    if (dartText === '') {
                        setDartValue(dart, 0, 1);
                    }
                    else {
                        scoreNumeric = parseInt(dartText) * dart.attr('data-multiplier');
                    }
                    checkVisitFinished(dart, scoreNumeric);
                    updateTotalVisitScore(scoreNumeric);
                }
                dartText = '';
                currentMultiplier = 1;*/


                var thrown = component.confirmThrow();
                if (thrown > 3) {
                    // Submit score to server!
                    console.log("Submitt!");
                }
                console.log(thrown);
                console.log('Enter');
                return;
            case '/': // Single
                currentMultiplier = 1;
                break;
            case '*': // Double
                currentMultiplier = 2;
                break;
            case ',': // Triple
            case '-': // Triple
                if (currentValue === 25) {
                    // Don't allow Triple bull
                    return;
                }
                currentMultiplier = 3;
                break;
            case '+': // Cycle through multipliers
                if (currentValue === 0) {
                    return;
                }
                currentMultiplier++;
                if (currentValue === 25) {
                    currentMultiplier = currentMultiplier > 2 ? 1 : currentMultiplier;
                } else {
                    currentMultiplier = currentMultiplier > 3 ? 1 : currentMultiplier;
                }
                break;
            case '1': text += '1'; break;
            case '2': text += '2'; break;
            case '3': text += '3'; break;
            case '4': text += '4'; break;
            case '5': text += '5'; break;
            case '6': text += '6'; break;
            case '7': text += '7'; break;
            case '8': text += '8'; break;
            case '9': text += '9'; break;
            case '0': text += '0'; break;
            default: /* Return */; return;
        }
        component.setDart(text, currentMultiplier);
    },
    findActive(components) {
        return _.filter(components, function (component) {
            if (component.state.isCurrentPlayer) {
                return component;
            }
        })[0];
    }
};
