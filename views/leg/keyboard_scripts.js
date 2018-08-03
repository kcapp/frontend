// Enter will be disabled when confirm dialogs are open
var disableEnter = false;

$(function () {
    var dartText = '';
    var currentMultiplier = 1;

    $(document).keypress(function (e) {
        if (e.key === 'Backspace') {
            var totalScoreContainer = $('.visits-active .dart-score-total');
            var currentPlayerScore = parseInt(totalScoreContainer.html());

            var dart = getCurrentDartContainer(currentDart);
            if (dartText !== '') {
                dartText = dartText.substring(0, dartText.length - 1);
                if (dartText === '') {
                    clearDart(dart);
                    scores[currentDart] = 0;
                }
                else {
                    setDartValue(dart, dartText * currentMultiplier, currentMultiplier);
                }
                // Make sure we don't change score for current player before we press ENTER
                totalScoreContainer.html(currentPlayerScore);
            } else {
                $('#undo-button').trigger('click');
            }
            e.preventDefault();
        }
        return;
    });

    $(document).keydown(function (e) {
        var totalScoreContainer = $('.visits-active .total-score');
        var currentPlayerScore = parseInt(totalScoreContainer.html());
        var dart = getCurrentDartContainer(currentDart);
        switch (e.key) {
            case 'Enter':
                if (disableEnter) {
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
                currentMultiplier = 1;
                return;
            case '/': // Single
                currentMultiplier = 1;
                break;
            case '*': // Double
                currentMultiplier = 2;
                break;
            case ',': // Triple
            case '-': // Triple
                var value = parseInt(dartText);
                if (value === 25) {
                    disableEnter = true;
                    showAlert('Invalid value', function () { });
                    return;
                }
                currentMultiplier = 3;
                break;
            case '+': // Cycle through multipliers
                var value = parseInt(dartText);
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
                totalScoreContainer.html(currentPlayerScore);
                return;
            case '1': dartText += '1'; break;
            case '2': dartText += '2'; break;
            case '3': dartText += '3'; break;
            case '4': dartText += '4'; break;
            case '5': dartText += '5'; break;
            case '6': dartText += '6'; break;
            case '7': dartText += '7'; break;
            case '8': dartText += '8'; break;
            case '9': dartText += '9'; break;
            case '0': dartText += '0'; break;
            default: /* NOOP */; break;
        }
        var value = parseInt(dartText);
        if ((value > 20 && value !== 25) || (value == 25 && currentMultiplier > 2)) {
            dartText = dartText.substring(0, dartText.length - 1);
            disableEnter = true;
            showAlert('Invalid value', function () { });
        }
        if (dartText !== '') {
            setCurrentDartContainerValues(dart, dartText * currentMultiplier, currentMultiplier);
        }
        // Make sure we don't change score for current player before we press ENTER
        totalScoreContainer.html(currentPlayerScore);
    });

    $('#toggle-keyboard-button').click(function () {
        location.href = '/legs/' + legId;
    });
});