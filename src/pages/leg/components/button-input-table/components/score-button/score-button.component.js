const alertify = require('../../../../../../util/alertify');

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

    onMount() {
        let holdTimer;
        let isHolding = false;
        let isTouch = false;

        const $buttons = $('[id^="btn-score-1-"], [id^="btn-score-2-"], [id^="btn-score-3-"]');
        $buttons.off('click mousedown touchstart mouseup touchend');
        $buttons.on('mousedown touchstart', (event) => {
            if (isTouch && event.type === 'touchstart') {
                return;
            }

            isHolding = false;
            isTouch = event.type === 'touchstart';

            holdTimer = setTimeout(() => {
                isHolding = true;

                this.emitButtonPress(event.target);
                this.emitButtonPress(event.target);
                this.emitButtonPress(event.target);
            }, 500);

            if (isTouch) {
                event.preventDefault();
            }
        });
        $buttons.on('mouseup touchend', (event) => {
            clearTimeout(holdTimer);

            if (!isHolding) {
                this.emitButtonPress(event.target);
            }
            isTouch = false;
            event.stopImmediatePropagation();
        });
    },

    onClick(event) {
        const target = event.target;
        if (this.state.isUndo) {
            this.emit('button-press', null, null, true);
        }
        /* else {
            const score = parseInt(target.getAttribute('data-score'));
            const multiplier = parseInt(target.getAttribute('data-multiplier'));
            this.emit('button-press', score, multiplier, false);
        }*/
        target.blur();
    },

    emitButtonPress(target) {
        const score = parseInt(target.getAttribute('data-score'));
        const multiplier = parseInt(target.getAttribute('data-multiplier'));
        this.emit('button-press', score, multiplier, false);
        target.blur();
    }
}