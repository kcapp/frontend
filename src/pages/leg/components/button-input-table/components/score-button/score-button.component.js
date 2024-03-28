module.exports = {
    onInput(input) {
        let clazz = 'btn-score btn-info btn-lg btn-block btn-score';
        if (input.clazz) {
            clazz += ` ${input.clazz}`;
        } else if (input.multiplier === 3) {
            clazz += ' btn-triple';
        } else if (input.multiplier === 2) {
            clazz += ' btn-double';
        }
        if (input.extra_clazz) {
            clazz += ` ${input.extra_clazz}`;
        }

        this.state = {
            isUndo: input.isUndo || false,
            clazz: clazz
        }
    },

    onClick(event) {
        const target = event.target;
        if (this.state.isUndo) {
            this.emit('button-press', null, null, true);
        } else {
            const score = parseInt(target.getAttribute('data-score'));
            const multiplier = parseInt(target.getAttribute('data-multiplier'));
            this.emit('button-press', score, multiplier, false);
        }
        target.blur();
    }
}