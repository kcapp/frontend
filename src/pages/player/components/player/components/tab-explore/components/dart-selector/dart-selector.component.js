module.exports = {
    onCreate() {
        this.state = {
            darts: [ "T-20", "D-20", "20", "T-19", "D-19", "19", "T-18", "D-18", "18", "T-17", "D-17", "17", "T-16", "D-16", "16",
                     "T-15", "D-15", "15", "T-14", "D-14", "14", "T-13", "D-13", "13", "T-12", "D-12", "12", "T-11", "D-11", "11", 
                     "T-10", "D-10", "10", "T-9", "D-9", "9", "T-8", "D-8", "8", "T-7", "D-7", "7", "T-6", "D-6", "6", "T-5", "D-5", 
                        "5", "T-4", "D-4", "4", "T-3", "D-3", "3", "T-2", "D-2", "2", "T-1", "D-1", "1", "D-Bull", "Bull", "Miss"]
        };
    },
    handleDartChange(event, selected) {
        const value = selected.value;
        let dart = {};
        if (value === "-1") {
            dart = null;
        } else if (value === "Miss") { 
            dart.value = 0;
            dart.multiplier = 1;
        } else if (value === "Bull") {
            dart.value = 25;
            dart.multiplier = 1;
        } else if (value === "D-Bull") {
            dart.value = 25;
            dart.multiplier = 2;
        } else if (value.indexOf("-") !== -1) {
            const split = value.split("-");
            dart.value = parseInt(split[1]);
            dart.multiplier = split[0] == "T" ? 3 : 2;
        } else {
            dart.value = parseInt(value);
            dart.multiplier = 1;
        }
        this.emit("dart-change", dart);
    }
}
