exports.X01 = 1;
exports.SHOOTOUT = 2;
exports.X01HANDICAP = 3;
exports.CRICKET = 4;
exports.DARTS_AT_X = 5;
exports.AROUND_THE_WORLD = 6;
exports.SHANGHAI = 7;
exports.AROUND_THE_CLOCK = 8;
exports.TIC_TAC_TOE = 9;
exports.BERMUDA_TRIANGLE = 10;
exports.FOUR_TWENTY = 11;

exports.OUTSHOT_DOUBLE = 1;
exports.OUTSHOT_MASTER = 2;
exports.OUTSHOT_ANY = 3;

// Define types which support a simple input mode
exports.SUPPORT_SIMPLE_INPUT = [ 5, 6, 7, 8, 10, 11 ];

exports.TARGET_BERMUDA_TRIANGLE = [
    { label: "Not Used"}, // Placeholder as round starts on 1
    { label: 12, value: 12, multipliers: [1, 2, 3] },
    { label: 13, value: 13, multipliers: [1, 2, 3] },
    { label: 14, value: 14, multipliers: [1, 2, 3] },
    { label: "Any Double", value: -1, multipliers: [2] },
    { label: 15, value: 15, multipliers: [1, 2, 3] },
    { label: 16, value: 16, multipliers: [1, 2, 3] },
    { label: 17, value: 17, multipliers: [1, 2, 3] },
    { label: "Any Triple", value: -1, multipliers: [3] },
    { label: 18, value: 18, multipliers: [1, 2, 3] },
    { label: 19, value: 19, multipliers: [1, 2, 3] },
    { label: 20, value: 20, multipliers: [1, 2, 3] },
    { label: "Any Bull", value: 25, multipliers: [1, 2], score: 25 },
    { label: "D-Bull", value: 25, multipliers: [2] } ];

exports.TARGET_FOUR_TWENTY = [
    { label: "Not Used"}, // Placeholder as round starts on 1
    { label: 1, value: 1, multipliers: [ 2 ] },
    { label: 18, value: 18, multipliers: [ 2 ] },
    { label: 4, value: 4, multipliers: [ 2 ] },
    { label: 13, value: 13, multipliers: [ 2 ] },
    { label: 6, value: 6, multipliers: [ 2 ] },
    { label: 10, value: 10, multipliers: [ 2 ] },
    { label: 15, value: 15, multipliers: [ 2 ] },
    { label: 2, value: 2, multipliers: [ 2 ] },
    { label: 17, value: 17, multipliers: [ 2 ] },
    { label: 3, value: 3, multipliers: [ 2 ] },
    { label: 19, value: 19, multipliers: [ 2 ] },
    { label: 7, value: 7, multipliers: [ 2 ] },
    { label: 16, value: 16, multipliers: [ 2 ] },
    { label: 8, value: 8, multipliers: [ 2 ] },
    { label: 11, value: 11, multipliers: [ 2 ] },
    { label: 14, value: 14, multipliers: [ 2 ] },
    { label: 9, value: 9, multipliers: [ 2 ] },
    { label: 12, value: 12, multipliers: [ 2 ] },
    { label: 5, value: 5, multipliers: [ 2 ] },
    { label: 20, value: 20, multipliers: [ 2 ] } ];
