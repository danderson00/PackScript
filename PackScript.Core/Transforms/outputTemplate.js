(function () {
    pack.transforms.add('outputTemplate', 'content', function (data) {
        var value = data.value;
        var target = data.target;
        var output = data.output;
        
        var template = pack.templates[templateName()];
        if (template) {
            Log.debug('Applying template ' + templateName() + ' to ' + output.transforms.to);
                
            var templateData = _.extend({
                content: target.output,
                configPath: Path(output.configPath),
            }, value.data);

            try {
                target.output = _.template(template, templateData);
            } catch(ex) {
                Pack.utils.logError(ex, "An error occurred applying template " + templateName());
            }
        }
            
        function templateName() {
            return value.name || value;
        }
    });    
})();

