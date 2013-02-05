(function () {
    pack.transforms.add('template', 'content', function (data) {
        var value = data.value;
        var output = data.output;
        var target = data.target;
        
        _.each(target.files.list, applyTemplate);

        function applyTemplate(file) {
            var template = pack.templates[templateName()];
            var path = Path(file.path);
            if (template) {
                Log.debug('Applying template ' + templateName() + ' to ' + Path(file.path).filename());
                var templateData = _.extend({
                    content: file.content,
                    path: path,
                    configPath: Path(output.basePath),
                    pathRelativeToConfig: Path(file.path.replace(path.matchFolder(output.basePath), '')),
                    includePath: includePath(),
                    pathRelativeToInclude: Path(file.path.replace(path.matchFolder(includePath()), ''))
                }, value.data, file.template && file.template.data);
                file.content = _.template(template, templateData);
            }
            
            function templateName() {
                if (file.template)
                    return file.template.name || file.template;
                return value.name || value;
            }
            
            function includePath() {
                return Path(output.basePath + file.filespec).withoutFilename();
            }
        }
    });    
})();

