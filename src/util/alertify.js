const TITLE = 'kcapp';
var alertify;

function setTheme() {
    this.alertify.defaults.theme.ok = "btn btn-primary";
    this.alertify.defaults.theme.cancel = "btn btn-basic";
    this.alertify.defaults.theme.input = "form-control";
}

function bootstrap() {
    if (!this.alertify) {
        this.alertify = require('alertifyjs');
        this.alertify.defaults.hooks.postinit = function(instance) {
            instance.elements.root.onkeydown = function(e) {
                if (e.key === "Backspace") {
                    // Close dialog if Backspace is pressed to easier navigate when using Numpad
                    instance.settings.oncancel()
                    instance.close();
                    e.stopPropagation();
                }
            }
        }
        setTheme();
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
    return bootstrap().confirm(text, okFnc, cancelFnc)
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

exports.error = (text) => {
    bootstrap().error(text);
}

exports.notify = (text, clazz, wait, callback) => {
    return bootstrap().notify(text, clazz, wait, callback);
}
