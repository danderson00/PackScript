Pack.prototype.fileChanged = function (path, changeType) {
    var self = this;

    if (Path(path).match(this.options.configurationFileFilter) || Path(path).match(this.options.packFileFilter))
        handleConfigChange();
    else if (Path(path).match('*' + this.options.templateFileExtension))
        handleTemplateChange();
    else
        handleFileChange();

    function handleFileChange() {
        var refresh = changeType === 'create';
        self.build(self.matchingOutputs(path, refresh));
    }

    function handleConfigChange() {
        self.removeConfigOutputs(path);
        if (changeType !== 'delete') {
            self.loadConfig(path, Pack.api.Files.getFileContents([path])[path]);
            self.build(self.configOutputs(path));
        }
    }

    function handleTemplateChange() {
        if (changeType !== 'delete')
            self.loadTemplate(path);
    }
};
