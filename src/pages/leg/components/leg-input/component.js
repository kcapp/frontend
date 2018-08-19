const _ = require("underscore");

module.exports = {
    onCreate() {

    },
    onInput(input) {
        var roundNumber = Math.floor(input.leg.visits.length / input.leg.players.length) + 1;
        var matchName = input.match.match_mode.short_name;
        this.state = {
            roundNumber: roundNumber,
            matchName: matchName,
            text: '',
            thrownDarts: 0
        }
    },
    onMount() {
        document.addEventListener("keydown", this.onKeyDown.bind(this), false);
        document.addEventListener("keypress", this.onKeyPress.bind(this), false);
    },
    onKeyPress(e) {

    },

    onKeyDown(e) {
        var component = this.findActive(this.getComponents('players'));


        //var text = this.state.text;
        var text = '';
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

                /*this.state.thrownDarts++;
                if (this.state.thrownDarts > 3) {
                    console.log("Submitt"); // TODO Submit the score
                }else {
                    component.confirmThrow();
                }*/
                component.confirmThrow();
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
                /*var value = parseInt(dartText);
                if (value === 25) {
                    disableEnter = true;
                    showAlert('Invalid value', function () { });
                    return;
                }
                currentMultiplier = 3;*/
                currentMultiplier = 3;
                break;
            case '+': // Cycle through multipliers
                /*var value = parseInt(dartText);
                if (dartText === '' || value === 0) {
                    return;
                }
                currentMultiplier++;
                if (value === 25) {
                    currentMultiplier = currentMultiplier > 2 ? 1 : currentMultiplier;
                } else {
                    currentMultiplier = currentMultiplier > 3 ? 1 : currentMultiplier;
                }
                setDartValue(dart, dartText * currentMultiplier, currentMultiplier);
                totalScoreContainer.html(currentPlayerScore);*/
                currentMultiplier++;
                currentMultiplier = currentMultiplier > 3 ? 1 : currentMultiplier;
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
        component.setMultiplier(currentMultiplier);

        // this.state.text = text;
        component.setValue(text);
    },
    findActive(components) {
        return _.filter(components, function (component) {
            if (component.state.isCurrentPlayer) {
                return component;
            }
        })[0];
    }
};
