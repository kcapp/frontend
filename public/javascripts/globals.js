// Add a global event listener, that allows us to navigate back to the main page
// from anywhere, by pressing the home button
document.addEventListener("keydown", (event) => {
    if (location.pathname === '/' || event.target.tagName === 'INPUT') {
        // Noop if we are already on home page, or if target is a input
        return;
    }
    if (event.key === "Home"){
        location.href = "/";
    }
});

window.kcapp = {
    value: new Date(),
    reset() { },
    get lastEvent() {
        return this.value;
    },
    set lastEvent(value) {
        this.value = value;
        this.reset();
    }
};

window.onload = () => {
    const isController = localStorage.getItem("kcapp:controller");
    if (isController && !location.href.includes('screensaver')) {
        const screensaverTimeout = 5 /* minutes */ * 10 * 1000; // ms
        const forwardToScreensaverFunc = () => {
            location.href = "/screensaver";
        }
        // Forward controller to screensaver
        let screensaverInterval = setTimeout(forwardToScreensaverFunc, screensaverTimeout);
        window.kcapp.reset = () => {
            clearInterval(screensaverInterval);
            screensaverInterval = setTimeout(forwardToScreensaverFunc, screensaverTimeout);
        }
        window.onclick = () =>{
            clearInterval(screensaverInterval);
            screensaverInterval = setTimeout(forwardToScreensaverFunc, screensaverTimeout);
        }
    }
}
