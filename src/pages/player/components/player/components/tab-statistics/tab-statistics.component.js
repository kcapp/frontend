module.exports = {
    typeChanged(typeId) {
        this.emit('type-changed', typeId);
    }
};
