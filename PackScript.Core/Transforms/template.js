(function () {
    pack.transforms.add('template', 'content', function (data) {
        var value = data.value;
        var output = data.output;
        var target = data.target;
        
        _.each(target.files.list, applyTemplates);

        function applyTemplates(file) {
            var templateConfiguration = file.template || value;
            Pack.utils.executeSingleOrArray(templateConfiguration, function(templateSettings) {
                normaliseTemplateSettings();
                
                var template = pack.templates[templateSettings.name];
                var path = Path(file.path);
                if (template) {
                    Log.debug('Applying template ' + templateSettings.name + ' to ' + Path(file.path).filename());
                    var templateData = {
                        content: file.content,
                        path: path,
                        configPath: Path(output.basePath),
                        pathRelativeToConfig: Path(file.path.replace(path.matchFolder(output.basePath), '').replace(/\\/g, '/')),
                        includePath: includePath(),
                        pathRelativeToInclude: Path(file.path.replace(path.matchFolder(includePath()), '').replace(/\\/g, '/')),
                        data: templateSettings.data || {}
                    };

                    try {
                        file.content = _.template(template, templateData);
                    } catch(ex) {
                        Pack.utils.logError(ex, "An error occurred applying template " + templateSettings.name);
                    }
                }

                function includePath() {
                    return Path(output.basePath + file.filespec).withoutFilename();
                }

                function normaliseTemplateSettings() {
                    if (templateSettings.constructor === String)
                        templateSettings = { name: templateSettings };
                }
            });
        }
    });    
})();