function setTheme(alertify) {
    alertify.defaults.theme.ok = "btn btn-primary";
    alertify.defaults.theme.cancel = "btn btn-basic";
    alertify.defaults.theme.input = "form-control";
}

exports.alert = (text, okFnc) => {
    const alertify = require('alertifyjs');
    setTheme(alertify);
    alertify.alert(text, okFnc)
        .setting({ title: 'Darts Scorer' })
        .set({ transition: 'zoom' })
        .show();
}