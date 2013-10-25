(function () {
    pack.transforms.add('outputTemplate', 'output', function (data) {
        var value = data.value;
        var target = data.target;
        var output = data.output;

        Pack.utils.executeSingleOrArray(value, function(templateSettings) {
            normaliseTemplateSettings();

            var template = pack.templates[templateSettings.name];
            if (template) {
                Log.debug('Applying output template ' + templateSettings.name + ' to ' + output.transforms.to);

                var templateData = {
                    content: target.output,
                    configPath: Path(output.configPath),
                    data: value.data || {},
                    output: output,
                    target: target
                };

                try {
                    target.output = _.template(template, templateData);
                } catch(ex) {
                    Pack.utils.logError(ex, "An error occurred applying template " + templateSettings.name);
                }
            }

            function normaliseTemplateSettings() {
                if (templateSettings.constructor === String)
                    templateSettings = { name: templateSettings };
            }
        });
    });
})();

