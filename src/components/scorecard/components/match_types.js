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
exports.KILL_BULL = 12;
exports.GOTCHA = 13;
exports.JDC_PRACTICE = 14;
exports.KNOCKOUT = 15;

// Outshots
exports.OUTSHOT_DOUBLE = 1;
exports.OUTSHOT_MASTER = 2;
exports.OUTSHOT_ANY = 3;

// Define types which support a simple input mode
exports.SUPPORT_SIMPLE_INPUT = [ 5, 6, 7, 8, 10, 11, 12, 14 ];

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
    { label: "D1", value: 1, multipliers: [ 2 ] },
    { label: "D18", value: 18, multipliers: [ 2 ] },
    { label: "D4", value: 4, multipliers: [ 2 ] },
    { label: "D13", value: 13, multipliers: [ 2 ] },
    { label: "D6", value: 6, multipliers: [ 2 ] },
    { label: "D10", value: 10, multipliers: [ 2 ] },
    { label: "D15", value: 15, multipliers: [ 2 ] },
    { label: "D2", value: 2, multipliers: [ 2 ] },
    { label: "D17", value: 17, multipliers: [ 2 ] },
    { label: "D3", value: 3, multipliers: [ 2 ] },
    { label: "D19", value: 19, multipliers: [ 2 ] },
    { label: "D7", value: 7, multipliers: [ 2 ] },
    { label: "D16", value: 16, multipliers: [ 2 ] },
    { label: "D8", value: 8, multipliers: [ 2 ] },
    { label: "D11", value: 11, multipliers: [ 2 ] },
    { label: "D14", value: 14, multipliers: [ 2 ] },
    { label: "D9", value: 9, multipliers: [ 2 ] },
    { label: "D12", value: 12, multipliers: [ 2 ] },
    { label: "D5", value: 5, multipliers: [ 2 ] },
    { label: "D20", value: 20, multipliers: [ 2 ] },
    { label: "Double Bull", value: 25, multipliers: [ 2 ] } ];

exports.TARGET_JDC_PRACTICE = [
    { label: "Not Used"}, // Placeholder as round starts on 1
    { label: "10 (Shanghai)", value: 10, multipliers: [1, 2, 3] },
    { label: "11 (Shanghai)", value: 11, multipliers: [1, 2, 3] },
    { label: "12 (Shanghai)", value: 12, multipliers: [1, 2, 3] },
    { label: "13 (Shanghai)", value: 13, multipliers: [1, 2, 3] },
    { label: "14 (Shanghai)", value: 14, multipliers: [1, 2, 3] },
    { label: "15 (Shanghai)", value: 15, multipliers: [1, 2, 3] },
    [ { label: "D1", value: 1, multipliers: [2] }, { label: "D2", value: 2, multipliers: [2] }, { label: "D3", value: 3, multipliers: [2] } ],
    [ { label: "D4", value: 4, multipliers: [2] }, { label: "D5", value: 5, multipliers: [2] }, { label: "D6", value: 6, multipliers: [2] } ],
    [ { label: "D7", value: 7, multipliers: [2] }, { label: "D8", value: 8, multipliers: [2] }, { label: "D9", value: 9, multipliers: [2] } ],
    [ { label: "D10", value: 10, multipliers: [2] }, { label: "D11", value: 11, multipliers: [2] }, { label: "D12", value: 12, multipliers: [2] } ],
    [ { label: "D13", value: 13, multipliers: [2] }, { label: "D14", value: 14, multipliers: [2] }, { label: "D15", value: 15, multipliers: [2] } ],
    [ { label: "D16", value: 16, multipliers: [2] }, { label: "D17", value: 17, multipliers: [2] }, { label: "D18", value: 18, multipliers: [2] } ],
    [ { label: "D19", value: 19, multipliers: [2] }, { label: "D20", value: 20, multipliers: [2] }, { label: "D-Bull", value: 25, multipliers: [2] } ],
    { label: "15 (Shanghai)", value: 15, multipliers: [1, 2, 3] },
    { label: "16 (Shanghai)", value: 16, multipliers: [1, 2, 3] },
    { label: "17 (Shanghai)", value: 17, multipliers: [1, 2, 3] },
    { label: "18 (Shanghai)", value: 18, multipliers: [1, 2, 3] },
    { label: "19 (Shanghai)", value: 19, multipliers: [1, 2, 3] },
    { label: "20 (Shanghai)", value: 20, multipliers: [1, 2, 3] } ];

exports.SCORES_x01 = [ { id: 301, name: '301' }, { id: 501, name: '501' }, { id: 701, name: '701' } ];
exports.SCORES_TIC_TAC_TOE = [
    { id: 0, name: '+0' }, { id: 10, name: '+10' },
    { id: 20, name: '+20' }, { id: 25, name: '+25' }, { id: 30, name: '+30' },
    { id: 40, name: '+40' }, { id: 50, name: '+50' } ];
exports.SCORES_DARTS_AT_X = [
        { id: 20, name: 20 },  { id: 19, name: 19 }, { id: 18, name: 18 }, { id: 17, name: 17 },
        { id: 16, name: 16 }, { id: 15, name: 15 }, { id: 14, name: 14 }, { id: 13, name: 13 },
        { id: 12, name: 12 }, { id: 11, name: 11 }, { id: 10, name: 10 }, { id: 9, name: 9 },
        { id: 8, name: 8 }, { id: 7, name: 7 }, { id: 6, name: 6 }, { id: 5, name: 5 },
        { id: 4, name: 4 }, { id: 3, name: 3 }, { id: 2, name: 2 }, { id: 1, name: 1 }, { id: 25, name: 'Bull' } ];
exports.SCORES_GOTCHA = [ { id: 200, name: '200' }, { id: 300, name: '300' }, { id: 500, name: '500' } ];
exports.SCORES_KILL_BULL = [
    { id: 150, name: '150' }, { id: 200, name: '200' },
    { id: 250, name: '250' }, { id: 300, name: '300' }, { id: 500, name: '500' } ];
exports.SCORES_FOUR_TWENTY = [ { id: 420, name: 420 } ];
