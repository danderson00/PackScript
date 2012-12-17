Pack.Output = function (transforms, configPath) {
    var self = this;

    this.configPath = configPath;
    this.basePath = Path(configPath).withoutFilename().toString();
    this.outputPath = Path(this.basePath + (transforms && transforms.to)).toString();

    this.files = new FileList();
    this.transforms = transforms;

    this.build = function () {
        return pack.transforms.applyTo(self);
    };

    this.matches = function (path) {
        return self.files.paths().indexOf(path) > -1;
    };
};

Pack.prototype.addOutput = function (transforms, configPath) {
    if (transforms && transforms.to) {
        var output = new Pack.Output(transforms, configPath);
        this.outputs.push(output);
        return output;
    }
};

Pack.prototype.matchingOutputs = function (path) {
    var outputs = this.outputs;
    return _.union.apply(_, Pack.utils.executeSingleOrArray(path, matchSingle));

    function matchSingle(item) {
        return _.filter(outputs, function (output) {
            return output.constructor === Pack.Output && output.matches(item);
        });
    }
};

Pack.prototype.cleanConfig = function (path) {
    var outputs = this.outputs;
    _.each(outputs.slice(0), function(output) {
        if (output.configPath === path)
            outputs.splice(outputs.indexOf(output), 1);
    });
};

Pack.prototype.configOutputs = function(path) {
    return _.filter(this.outputs, function (output) {
        return output.configPath === path;
    });
};