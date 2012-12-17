(function () {
    pack.transforms.add('load', 'content', function (value, output) {
        output.files.exclude(pack.loadedConfigs).exclude(output.outputPath);
        
        var fileContents = Files.getFileContents(output.files.paths());
        output.files.setProperty('content', fileContents);

        var fileCount = output.files && _.keys(output.files.list).length;
        Log.debug(fileCount ? 
            'Loaded content for ' + fileCount + ' files for ' + (output.transforms && output.transforms.to) :
            'No content to load for ' + (output.transforms && output.transforms.to));
    });
})();

(function () {
    var utils = Pack.utils;
    var transforms = pack.transforms;
    
    transforms.add('include', 'files', function (value, output) {
        Log.debug('Including ' + value + ' in ' + (output.transforms && output.transforms.to));
        output.files.include(loadFileList(value, output));
    });
    
    transforms.add('exclude', 'files', function (value, output) {
        Log.debug('Excluding ' + value + ' from ' + (output.transforms && output.transforms.to));
        output.files.exclude(loadFileList(value, output));
    });

    transforms.add('prioritise', 'files', function(value, output) {
        utils.executeSingleOrArray(value, output.files.prioritise);
    });

    function loadFileList(values, output) {
        var allFiles = new FileList();
        var loadedFiles = utils.executeSingleOrArray(values, loadIndividualFileList);
        utils.executeSingleOrArray(loadedFiles, allFiles.include);
        return allFiles;

        function loadIndividualFileList(value) {
            var files = new FileList();

            if (value.constructor === String)
                files.include(getFiles(value));
            else if (_.isObject(value))
                files.include(getFiles(value.files || '*.*'));

            prioritise();

            return files;

            function getFiles(filespec) {
                return _.map(getFileNames(filespec), function (file) {
                    return {
                        path: file,
                        template: value.template
                    };
                });
            }

            function getFileNames(filespec) {
                return Files.getFilenames(output.basePath + filespec, recurse());
            }
            
            function prioritise() {
                if (value.prioritise)
                    utils.executeSingleOrArray(value.prioritise, files.prioritise, true);
            }

            function recurse() {
                return value.recursive === true || (output.transforms.recursive === true && value.recursive !== false);
            }
        }
    }
})();

(function () {
    pack.transforms.add('to', 'finalise', function (value, output) {
        var path = Path(output.basePath + output.transforms.to);
        Files.writeFile(path.toString(), output.output);
        Log.info('Wrote file ' + path);
    });
})();

(function () {
    pack.transforms.add('minify', 'output', function (value, output) {
        Log.debug('Minifying ' + output.transforms.to);
        switch (Path(output.transforms.to).extension().toString()) {
            case 'js':
                minify(typeof MinifyJavascript !== 'undefined' ? MinifyJavascript : null, output);
                break;
            case 'htm':
            case 'html':
                minify(typeof MinifyMarkup !== 'undefined' ? MinifyMarkup : null, output);
                break;
            case 'css':
                minify(typeof MinifyStylesheet !== 'undefined' ? MinifyStylesheet : null, output);
                break;
            default:
                Log.warn('Minification requested but not supported for ' + output.transforms.to);
        }
    });
    
    function minify(api, output) {
        if (api)
            output.output = api.minify(output.output);
        else
            Log.warn("Minification was requested but no appropriate API was provided for " + output.transforms.to);
    }
})();

(function () {
    pack.transforms.add('combine', 'output', function (value, output) {
        log();
        output.output = _.pluck(output.files.list, 'content').join('');
        
        function log() {
            // expensive operation, only do if logging is in debug mode
            if (Pack.options.logLevel === 'debug')
                Log.debug('(' + filenames() + ') -> ' + (output.transforms && output.transforms.to));
        }
        
        function filenames() {
            return _.map(output.files.paths(), function (path) {
                return path.replace(output.basePath, '');
            }).join(', ');;
        }
    });
})();

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

