// Enter will be disabled when confirm dialogs are open
var disableEnter = false;

$(function () {
    var dartText = '';
    var currentMultiplier = 1;

    $(document).keydown(function (e) {
        if (e.key === 'Backspace') {
            var dart = getCurrentDart();
            if (dartText !== '') {
                dartText = dartText.substring(0, dartText.length - 1);
                if (dartText === '') {
                    dart.text('');
                    dart.attr('data-score', 0);
                    dart.attr('data-multiplier', 1);
                    scores[currentDart] = 0;
                }
                else {
                    setDartValue(dart, dartText * currentMultiplier, currentMultiplier);
                }
            } else {
                $('#undo-button').trigger('click');
            }
            e.preventDefault();
        }
        return;
    });

    $(document).keypress(function (e) {
        var totalScoreContainer = $('.uv-active-player-visits .dart-score-total');
        var totalScoreForCurrentPlayer = parseInt(totalScoreContainer.html());
        var dart = getCurrentDart();
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
                currentMultiplier = 3;
                break;
            case '+': // Cycle through multipliers
                var value = parseInt(dartText);
                if (dartText === '' || value === 0) {
                    return;
                }
                currentMultiplier++;
                currentMultiplier = currentMultiplier > 3 ? 1 : currentMultiplier;
                setDartValue(dart, dartText * currentMultiplier, currentMultiplier);
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
        if (value > 20 && value !== 25) {
            dartText = dartText.substring(0, dartText.length - 1);
            disableEnter = true;
            showAlert('Invalid value', function () { });
        }
        if (dartText !== '') {
            setDartValue(dart, dartText * currentMultiplier, currentMultiplier);
        }
        if (disableEnter) {
            totalScoreContainer.html(totalScoreForCurrentPlayer);
        }
    });

    $('#toggle-keyboard-button').click(function () {
        location.href = '/matches/' + matchId;
    });
});