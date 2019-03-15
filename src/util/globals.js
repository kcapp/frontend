// Add a global event listener, that allows us to navigate back to the main page
// from anywhere, by pressing the home button
document.addEventListener("keydown", (event) => {
    if (event.key === "Home"){
        location.href = "/";
    }
});