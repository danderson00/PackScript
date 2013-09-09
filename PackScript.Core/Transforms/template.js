(function () {
    pack.transforms.add('template', 'content', function (data) {
        var value = data.value;
        var output = data.output;
        var target = data.target;
        
        _.each(target.files.list, applyTemplates);

        function applyTemplates(file) {
            var templateConfiguration = file.template || value;
            if (_.isFunction(templateConfiguration))
                templateConfiguration = templateConfiguration(data.output, data.target);
            
            Pack.utils.executeSingleOrArray(templateConfiguration, function(templateSettings) {
                normaliseTemplateSettings();
                
                var template = pack.templates[templateSettings.name];
                if (template) {
                    Log.debug('Applying template ' + templateSettings.name + ' to ' + Path(file.path).filename());
                    var templateData = {
                        content: file.content,
                        path: Path(file.path),
                        configPath: file.configPath,
                        pathRelativeToConfig: file.pathRelativeToConfig,
                        includePath: file.includePath,
                        pathRelativeToInclude: file.pathRelativeToInclude,
                        data: templateSettings.data || {}
                    };

                    try {
                        file.content = _.template(template, templateData);
                    } catch(ex) {
                        Pack.utils.logError(ex, "An error occurred applying template " + templateSettings.name);
                    }
                } else if (templateSettings.name) {
                    Log.warn("Unable to find template '" + templateSettings.name + "'.");
                }

                function normaliseTemplateSettings() {
                    if (templateSettings.constructor === String)
                        templateSettings = { name: templateSettings };
                }
            });
        }
    });    
})();