Pack.Output = function (transforms, configPath) {
    var self = this;
    
    this.configPath = configPath;
    this.basePath = Path(configPath).withoutFilename().toString();
    this.outputPath = Path(this.basePath + (transforms && transforms.to)).toString();
    this.transforms = transforms || {};
    
    // the currentPaths property is a cached list of file paths so we don't need to hit the filesystem 
    // for each call to matches. currentPaths gets set by finalise transforms to, zipTo and syncTo
    // the syncTo transform can also replace this function to override the default dehaviour
    this.getCurrentPaths = function(transformRepository) {
        return transformRepository.applyEventsTo(['includeFiles', 'excludeFiles'], self, { log: false }).files.paths();
    };
};

Pack.Output.prototype.matches = function (path, transformRepository, refresh) {
    if (refresh || !this.currentPaths)
        this.currentPaths = this.getCurrentPaths(transformRepository);
    
    return _.any(this.currentPaths, function(filePath) {
        return path.toUpperCase() === filePath.toUpperCase();
    });
};

Pack.Output.prototype.targetPath = function () {
    return this.transforms.to ||
        this.transforms.zipTo ||
        this.transforms.syncTo;
};