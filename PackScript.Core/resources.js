(function () {
    var options = Pack.options;

    Pack.prototype.scanForResources = function (path) {
        this.scanForConfigs(path);
        this.scanForTemplates(path);
    };

    Pack.prototype.scanForConfigs = function (path) {
        var allConfigs = _.union(
            Files.getFilenames(path + options.configurationFileFilter, true),
            Files.getFilenames(path + options.packFileFilter, true));
        this.loadedConfigs = allConfigs;
        var configs = Files.getFileContents(this.loadedConfigs);
        for (var configPath in configs)
            this.loadConfig(configPath, configs[configPath]);
    };

    Pack.prototype.loadConfig = function (path, source) {
        Log.info("Loading config from " + path);
        Context.configPath = path;
        Pack.utils.eval(source);
        delete Context.configPath;
    };

    Pack.prototype.scanForTemplates = function (path) {
        Log.info("Loading templates from " + path);
        var files = Files.getFilenames(path + '*' + options.templateFileExtension, true);
        var loadedTemplates = Files.getFileContents(files);
        for (var templatePath in loadedTemplates)
            this.templates[templateName(templatePath)] = loadedTemplates[templatePath];
    };

    function templateName(path) {
        var replaceRegex = new RegExp(Path(path).match(options.templateFileExtension) + '$');
        return Path(path).filename().toString().replace(replaceRegex, '');
    }

})();
