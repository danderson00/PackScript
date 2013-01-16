Pack.prototype.all = function () {
    this.build(this.outputs);
};

Pack.prototype.build = function (outputs) {
    Pack.utils.invokeSingleOrArray(outputs, 'build');
    var outputPaths = _.isArray(outputs) ? _.pluck(outputs, 'outputPath') : outputs.outputPath;
    var matchingOutputs = this.matchingOutputs(outputPaths);
    if (matchingOutputs.length > 0)
        this.build(matchingOutputs);
};

Pack.prototype.fileChanged = function (path) {
    if (Path(path).match(Pack.options.configurationFileFilter) || Path(path).match(Pack.options.packFileFilter)) {
        this.cleanConfig(path);
        this.loadConfig(path, Files.getFileContents([path])[path]);
        this.build(this.configOutputs(path));
    } else
        this.build(this.matchingOutputs(path));
};