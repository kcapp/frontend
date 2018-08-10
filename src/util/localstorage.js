function getKey(key) {
    return `kcapp:${key}`;
}

exports.get = key => localStorage.getItem(getKey(key));
exports.getInt = key => parseInt(localStorage.getItem(getKey(key)));
exports.set = (key, value) =>
    localStorage.setItem(getKey(key), value);
exports.getKey = getKey;