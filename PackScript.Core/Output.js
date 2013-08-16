Pack.Output = function (transforms, configPath) {
    this.configPath = configPath;
    this.basePath = Path(configPath).withoutFilename().toString();
    this.outputPath = Path(this.basePath + (transforms && transforms.to)).toString();
    this.transforms = transforms;
};

Pack.Output.prototype.matches = function (path, transformRepository, refresh) {
    if(refresh || !this.currentPaths)
        // this is a bit nasty, along with the finalise transform
        this.currentPaths = transformRepository.applyEventsTo(['includeFiles', 'excludeFiles'], this, { log: false }).files.paths();
    
    return _.any(this.currentPaths, function(filePath) {
        return Path(path).match(filePath);
    });
};

Pack.Output.prototype.build = function(transformRepository) {
    return transformRepository.applyTo(this);
};

Pack.prototype.addOutput = function (transforms, configPath) {
    var self = this;
    
    if (transforms)
        return Pack.utils.executeSingleOrArray(transforms, addSingleOutput);
    
    function addSingleOutput(transforms) {
        if (transforms)
            var output = new Pack.Output(transforms, configPath);
            self.outputs.push(output);
            return output;
    }
};