function Pack(options) {
    this.outputs = [];
    this.templates = {};
    this.loadedConfigs = [];
    this.transforms = Pack.transforms;
    
    this.options = _.extend({
        configurationFileFilter: '*pack.config.js',
        packFileFilter: '*pack.js',
        templateFileExtension: '.template.*',
        logLevel: 'debug',
        throttleTimeout: 200
    }, options);
}

Pack.prototype.setOptions = function(options) {
    _.extend(this.options, options);
    Log.setLevel(this.options.logLevel);
};

Pack.prototype.matchingOutputs = function (paths, refresh) {
    var self = this;
    var outputs = this.outputs;
    return _.union.apply(_, Pack.utils.executeSingleOrArray(paths, matchSingle));

    function matchSingle(item) {
        return _.filter(outputs, function (output) {
            return output.constructor === Pack.Output && output.matches(item, self.transforms, refresh);
        });
    }
};

Pack.prototype.removeConfigOutputs = function (path) {
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

Pack.prototype.addOutput = function (transforms, configPath) {
    var self = this;
    return Pack.utils.executeSingleOrArray(transforms, addSingleOutput);

    function addSingleOutput(transform) {
        if (transform) {
            var output = new Pack.Output(transform, configPath);
            self.outputs.push(output);
        }
        return output;
    }    
};

Pack.prototype.removeOutput = function(output) {
    this.outputs.splice(this.outputs.indexOf(output), 1);
};