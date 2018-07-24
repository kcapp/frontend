/**
 * Remove all classes from element and set one
 * @param {*} elementName 
 * @param {*} className 
 */
function setClass(elementName, className) {
    $('.' + element).removeClass().setClass(className);
}

$('#toggle-buttons').click(function () {
    $('#score-selector-table').toggle();
});

/**
 * Return active players' visit score by dart number
 * @param {*} dartNumber 
 */
function getActiveVisitDartScore(dartNumber) {
    if (dartNumber == 1) {
        $data = parseInt($('.visits-active .first').attr('data-score'));
    }
    if (dartNumber == 2) {
        $data = parseInt($('.visits-active .second').attr('data-score'));
    }
    if (dartNumber == 3) {
        $data = parseInt($('.visits-active .third').attr('data-score'));
    }

    return $data;
}

var firstScore = getActiveVisitDartScore(1);
var firstMultiplier = getActiveVisitDartMultiplier(1);
var secondScore = getActiveVisitDartScore(2);
var secondMultiplier = getActiveVisitDartMultiplier(2);
var thirdScore = getActiveVisitDartScore(3)
var thirdMultiplier =  getActiveVisitDartMultiplier(3);

/**
 * Return active players' visit score multiplier by dart number
 * @param {*} dartNumber 
 */
function getActiveVisitDartMultiplier(dartNumber) {
    if (dartNumber == 1) {
        $data = parseInt($('.visits-active .first').attr('data-multiplier'));
    }
    if (dartNumber == 2) {
        $data = parseInt($('.visits-active .second').attr('data-multiplier'));
    }
    if (dartNumber == 3) {
        $data = parseInt($('.visits-active .third').attr('data-multiplier'));
    }
}

parseInt($('.visits-active .first').attr('data-score'));

function getCurrentDartValue(currentDart) {
    var dart;
    if (currentDart === 1) {
        dart = $('.visits-active .first');
    }
    else if (currentDart === 2) {
        dart = $('.visits-active .second');
    }
    else if (currentDart === 3) {
        dart = $('.visits-active .third');
    }
    else {
        return null;
    }

    return dart;
}

function updateTotalVisitScore(score) {
    var totalScoreContainer = $('.visits-active .visits-score-total');
    var total = parseInt(totalScoreContainer.html()) + parseInt(score);
    totalScoreContainer.html(total);
}

function resetElements() {
    currentDart = 1;
    $('.visits-active .first').text('').removeClass('dart-score-single dart-score-double dart-score-triple');
    $('.visits-active .first').removeAttr('data-score');
    $('.visits-active .first').attr('data-multiplier', 1);
    $('.visits-active .first').attr('data-checkout', 0);

    $('.visits-active .second').text('').removeClass('dart-score-single dart-score-double dart-score-triple');
    $('.visits-active .second').removeAttr('data-score');
    $('.visits-active .second').attr('data-multiplier', 1);
    $('.visits-active .second').attr('data-checkout', 0);

    $('.visits-active .third').text('').removeClass('dart-score-single dart-score-double dart-score-triple');
    $('.visits-active .third').removeAttr('data-score');
    $('.visits-active .third').attr('data-multiplier', 1);
    $('.visits-active .third').attr('data-checkout', 0);

    $('#submit-score-button').data('busted', 0);
    $('#submit-score-button').data('finished', 0);
}