(function () {
    pack.transforms.add('template', 'content', function (value, output) {
        _.each(output.files.list, applyTemplate);

        function applyTemplate(file) {
            var templateName = templateName();
            var template = pack.templates[templateName];
            if (template) {
                Log.debug('Applying template ' + templateName + ' to ' + (output.transforms && output.transforms.to));
                var templateData = _.extend({
                    content: file.content,
                    path: file.path,
                    configPath: output.basePath,
                    pathRelativeToConfig: file.path.replace(output.basePath, '')
                }, value.data);
                file.content = _.template(template, templateData);
            }
            
            function templateName() {
                if (file.template)
                    return file.template.name || file.template;
                return value.name || value;
            }
        }
    });    
})();

