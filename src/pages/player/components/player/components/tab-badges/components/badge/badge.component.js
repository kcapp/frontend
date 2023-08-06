module.exports = {
    onCreate(input) {
        this.state = { 
            id: input.image.substring(input.image.lastIndexOf('/') + 1, input.image.lastIndexOf('.'))
        }
    },
    onMount() {
        if (this.state.id === 'badge_highscore') { 
            for (let i = 2; i < 8; i++) {
                setTimeout(() => {
                    const svg = document.getElementById(this.state.id).getSVGDocument();
                    for (let j = 2; j < 8; j++) {
                        svg.getElementById(`level${j}`).style.visibility = 'hidden';
                    }
                    svg.getElementById(`level${i}`).style.visibility = 'visible';
                }, 2000 + (i * 1000));
            }
        }
    }
}