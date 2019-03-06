
const TITLE = 'kcapp';
var alertify;

function setTheme(alertify) {
    alertify.defaults.theme.ok = "btn btn-primary";
    alertify.defaults.theme.cancel = "btn btn-basic";
    alertify.defaults.theme.input = "form-control";
}

function bootstrap() {
    if (!this.alertify) {
        this.alertify = require('alertifyjs');
        setTheme(this.alertify);
    }
    return this.alertify;
}

exports.alert = (text, okFnc) => {
    bootstrap().alert(text, okFnc)
        .setting({ title: TITLE })
        .set({ transition: 'zoom' })
        .show();
}
exports.confirm = (text, okFnc, cancelFnc) => {
    bootstrap().confirm(text, okFnc, cancelFnc)
        .setting({
            title: TITLE,
            defaultFocus: 'ok',
            labels: { ok: 'Submit', cancel: 'Cancel' },
            closable: false
        })
        .set({ transition: 'zoom' })
        .show();
}

exports.success = (text) => {
    bootstrap().success(text);
}