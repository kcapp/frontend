/**
 * Return active players' visit score by dart number
 * @param {*} dartNumber 
 */
function getActiveVisitDartScore(dartNumber) {
    if (dartNumber == 1) {
        data = parseInt($('.visits-active .first').attr('data-score'));
    }
    if (dartNumber == 2) {
        data = parseInt($('.visits-active .second').attr('data-score'));
    }
    if (dartNumber == 3) {
        data = parseInt($('.visits-active .third').attr('data-score'));
    }

    return data;
}

/**
 * Return active players' visit score multiplier by dart number
 * @param {*} dartNumber 
 */
function getActiveVisitDartMultiplier(dartNumber) {
    if (dartNumber == 1) {
        data = parseInt($('.visits-active .first').attr('data-multiplier'));
    }
    if (dartNumber == 2) {
        data = parseInt($('.visits-active .second').attr('data-multiplier'));
    }
    if (dartNumber == 3) {
        data = parseInt($('.visits-active .third').attr('data-multiplier'));
    }

    return data;
}
