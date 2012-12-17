﻿(function () {
    var options = Pack.options;

    Pack.prototype.scanForResources = function (path) {
        this.scanForConfigs(path);
        this.scanForTemplates(path);
    };

    Pack.prototype.scanForConfigs = function (path) {
        this.loadedConfigs = Files.getFilenames(path + options.configurationFileFilter, true);
        var configs = Files.getFileContents(this.loadedConfigs);
        for (var configPath in configs)
            this.loadConfig(configPath, configs[configPath]);
    };

    Pack.prototype.loadConfig = function (path, source) {
        Log.info("Loading config from " + path);
        Context.configPath = path;
        try {
            Pack.utils.eval(source);
        } catch (exception) {
            Pack.utils.logError(exception);
        }
        delete Context.configPath;
    };

    Pack.prototype.scanForTemplates = function (path) {
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