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

window.onload = () => {
    const isController = localStorage.getItem("kcapp:controller");
    if (isController && !location.href.includes('screensaver')) {
        // Forward controller to screensaver
        setTimeout(() => {
            location.href = "/screensaver";
        }, 2*60*1000);
    }
}
