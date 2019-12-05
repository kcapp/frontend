

module.exports = {
    getSuggestion(score) {
        switch (score) {
            case 2:  return 'D1';
            case 3:  return '1,D1';
            case 4:  return 'D2';
            case 5:  return '1,D2';
            case 6:  return 'D3';
            case 7:  return '3,D2';
            case 8:  return 'D4';
            case 9:  return '1,D4';
            case 10: return 'D5';
            case 11: return '3,D4';
            case 12: return 'D6';
            case 13: return '5,D4';
            case 14: return 'D7';
            case 15: return '7,D4';
            case 16: return 'D8';
            case 17: return '1,D8';
            case 18: return 'D9';
            case 19: return '3,D8';
            case 20: return 'D10';
            case 21: return '5,D8';
            case 22: return 'D11';
            case 23: return '7,D8';
            case 24: return 'D12';
            case 25: return '9,D8';
            case 26: return 'D13';
            case 27: return '11,D8';
            case 28: return 'D14';
            case 29: return '13,D8';
            case 30: return 'D15';
            case 31: return '15,D8';
            case 32: return 'D16';
            case 33: return '1,D16';
            case 34: return 'D17';
            case 35: return '3,D16';
            case 36: return 'D18';
            case 37: return '5,D16';
            case 38: return 'D19';
            case 39: return '7,D16';
            case 40: return 'D20';
            case 41: return '9,D16';
            case 42: return '10,D16';
            case 43: return '11,D16';
            case 44: return '12,D16';
            case 45: return '13,D16';
            case 46: return '14,D16';
            case 47: return '15,D16';
            case 48: return '16,D16';
            case 49: return '17,D16';
            case 50: return '18,D16';
            case 51: return '19,D16';
            case 52: return '20,D16';
            case 53: return '13,D20';
            case 54: return '14,D20';
            case 55: return '15,D20';
            case 56: return '16,D20';
            case 57: return '17,D20';
            case 58: return '18,D20';
            case 59: return '19,D20';
            case 60: return '20,D20';
            case 61: return 'T15,D8';
            case 62: return 'T10,D16';
            case 63: return 'T13,D12';
            case 64: return 'T16,D8';
            case 65: return 'T19,D4';
            case 66: return 'T10,D18';
            case 67: return 'T17,D8';
            case 68: return 'T20,D4';
            case 69: return '19,Bull';
            case 70: return 'T18,D8';
            case 71: return 'T13,D16';
            case 72: return 'T16,D12';
            case 73: return 'T19,D8';
            case 74: return 'T14,D16';
            case 75: return 'T13,D18';
            case 76: return 'T20,D8';
            case 77: return 'T15,D16';
            case 78: return 'T18,D12';
            case 79: return 'T13,D20';
            case 80: return 'T16,D16';
            case 81: return 'T15,D18';
            case 82: return 'T14,D20';
            case 83: return 'T17,D16';
            case 84: return 'T16,D18';
            case 85: return 'T15,D20';
            case 86: return 'T18,D16';
            case 87: return 'T17,D18';
            case 88: return 'T16,D20';
            case 89: return 'T19,D16';
            case 90: return 'T18,D18';
            case 91: return 'T17,D20';
            case 92: return 'T20,D16';
            case 93: return 'T19,D18';
            case 94: return 'T18,D20';
            case 95: return 'T19,D19';
            case 96: return 'D20,D18';
            case 97: return 'T19,D20';
            case 98: return 'T20,D19';
            case 99: return 'T19,10,D16';
            case 100: return 'T20,D20';
            case 101: return 'T19,10,D20';
            case 102: return 'T20,10,D16';
            case 103: return 'T19,14,D16';
            case 104: return 'T20,12,D16';
            case 105: return 'T20,13,D16';
            case 106: return 'T20,14,D16';
            case 107: return 'T20,15,D16';
            case 108: return 'T20,16,D16';
            case 109: return 'T20,17,D16';
            case 110: return 'T20,18,D16';
            case 111: return 'T20,19,D16';
            case 112: return 'T20,20,D16';
            case 113: return 'T20,13,D20';
            case 114: return 'T20,14,D20';
            case 115: return 'T20,15,D20';
            case 116: return 'T20,16,D20';
            case 117: return 'T20,17,D20';
            case 118: return 'T20,18,D20';
            case 119: return 'T20,19,D20';
            case 120: return 'T20,20,D20';
            case 121: return 'T19,T16,D8';
            case 122: return 'T18,18,Bull';
            case 123: return 'T20,T13,D12';
            case 124: return 'T20,T16,D8';
            case 125: return 'T20,T19,D4';
            case 126: return 'T19,19,Bull';
            case 127: return 'T20,T17,D8';
            case 128: return 'T20,T20,D4';
            case 129: return 'T19,T16,D12';
            case 130: return 'T20,T18,D8';
            case 131: return 'T20,T13,D16';
            case 132: return 'T20,T16,D12';
            case 133: return 'T20,T19,D8';
            case 134: return 'T20,T14,D16';
            case 135: return 'T20,T13,D18';
            case 136: return 'T20,T20,D8';
            case 137: return 'T18,T17,D16';
            case 138: return 'T20,T16,D15';
            case 139: return 'T20,T13,D20';
            case 140: return 'T20,T16,D16';
            case 141: return 'T20,T15,D18';
            case 142: return 'T20,T14,D20';
            case 143: return 'T20,T17,D16';
            case 144: return 'T20,T20,D12';
            case 145: return 'T20,T15,D20';
            case 146: return 'T20,T18,D16';
            case 147: return 'T20,T17,D18';
            case 148: return 'T20,T20,D14';
            case 149: return 'T20,T19,D16';
            case 150: return 'T20,T18,D18';
            case 151: return 'T20,T17,D20';
            case 152: return 'T20,T20,D16';
            case 153: return 'T20,T19,D18';
            case 154: return 'T20,T18,D20';
            case 155: return 'T20,T19,D19';
            case 156: return 'T20,T20,D18';
            case 157: return 'T19,T20,D20';
            case 158: return 'T20,T20,D19';
            case 160: return 'T20,T20,D20';
            case 161: return 'T20,T17,Bull';
            case 164: return 'T19,T19,Bull';
            case 167: return 'T20,T19,Bull';
            case 170: return 'T20,T20,Bull';
            default: return '';
        }
    },
    onInput(input) {
        this.state = {suggestion: this.process(this.getSuggestion(input.score))};
    },
    process(txtSuggestion) {
        if (txtSuggestion.length <= 0) {
            return [];
        }
        const darts = txtSuggestion.split(',');
        const suggestion = [];
        for (let i in darts) {
            switch (darts[i].substring(0, 1)) {
                case 'T':
                    suggestion[i] = {modifier: 'triple', value: 'T-' + darts[i].substring(1)};
                    break;
                case 'D':
                    suggestion[i] = {modifier: 'double', value: 'D-' + darts[i].substring(1)};
                    break;
                case 'B':
                    suggestion[i] = {modifier: 'double', value: 'Bull'};
                    break;
                default:
                    suggestion[i] = {modifier: 'single', value: darts[i]};
                    break;
            }
        }
        return suggestion;
    },
};
