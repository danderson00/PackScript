Pack.Output = function (transforms, configPath) {
    this.configPath = configPath;
    this.basePath = Path(configPath).withoutFilename().toString();
    this.outputPath = Path(this.basePath + (transforms && transforms.to)).toString();
    this.transforms = transforms || {};
};

Pack.Output.prototype.matches = function (path, transformRepository, refresh) {
    // we save the list of file paths so we don't need to hit the filesystem for each check
    // this gets set by finalise transforms to, zipTo and syncTo
    if(refresh || !this.currentPaths)
        this.currentPaths = transformRepository.applyEventsTo(['includeFiles', 'excludeFiles'], this, { log: false }).files.paths();
    
    return _.any(this.currentPaths, function(filePath) {
        return Path(path).match(filePath);
    });
};

Pack.Output.prototype.build = function(transformRepository) {
    return transformRepository.applyTo(this);
};

Pack.Output.prototype.targetPath = function () {
    return this.transforms.to ||
        this.transforms.zipTo ||
        this.transforms.syncTo;
};