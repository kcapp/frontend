module.exports = {
    onCreate(input) {
        var clazz = 'btn-score btn-info btn-lg btn-block';
        if (input.clazz) {
            clazz += ' ' + input.clazz;
        } else if (input.multiplier === 3) {
            clazz += ' btn-triple';
        } else if (input.multiplier === 2) {
            clazz += ' btn-double';
        }
        this.state = {
            isUndo: input.isUndo || false,
            clazz: clazz
        }
    },
    onClick(event) {
        var target = event.target;
        if (this.state.isUndo) {
            this.emit('button-press', null, null, true);
        } else {
            var score = parseInt(target.getAttribute('data-score'));
            var multiplier = parseInt(target.getAttribute('data-multiplier'));

            this.emit('button-press', score, multiplier, false);
        }
        target.blur();
    }
}