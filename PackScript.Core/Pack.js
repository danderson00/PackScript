function Pack() {
    this.outputs = [];
    this.templates = {};
    this.loadedConfigs = [];
    this.transforms = new Pack.TransformRepository();
}

Pack.options = {
    configurationFileFilter: '*pack.config.js',
    packFileFilter: '*pack.js',
    templateFileExtension: '.template.*',
    logLevel: 'debug'
};
