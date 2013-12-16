(function () {
    var utils = Pack.utils;
    var transforms = Pack.transforms;

    transforms.include = {
        event: 'includeFiles',
        apply: function(data) {
            Pack.api.Log.debug('Including ' + formatInclude(data.value, data.output) + ' in ' + data.output.targetPath());
            data.target.files.include(loadFileList(data.value, data.output));
        }
    };
    
    transforms.exclude = {
        event: 'excludeFiles',
        apply: function(data) {
            Pack.api.Log.debug('Excluding ' + formatInclude(data.value, data.output) + ' from ' + data.output.targetPath());
            data.target.files.exclude(loadFileList(data.value, data.output));
        }
    };

    function loadFileList(allValues, output) {
        var Files = Pack.api.Files;
        var allFiles = new Pack.FileList();
        utils.executeSingleOrArray(allValues, includeValue);
        return allFiles;

        function includeValue(value) {
            allFiles.include(loadIndividualFileList(value));
        }

        function loadIndividualFileList(value) {
            var files = new Pack.FileList();

            if (_.isFunction(value))
                value = value(output);
            if (!value)
                value = '*.*';
            if (value.constructor === String)
                files.include(getFiles(value));
            else if (_.isObject(value))
                files.include(getFiles(value.files || '*.*'));

            prioritise();

            return files;

            function getFiles(filespec) {
                return _.map(getFileNames(filespec), function (file) {
                    var includePath = Path(output.basePath + filespec).withoutFilename();
                    var path = Path(file);
                    return {
                        path: path,
                        template: value.template,
                        filespec: filespec,
                        configPath: Path(output.basePath),
                        pathRelativeToConfig: Path(file.replace(path.matchFolder(output.basePath), '').replace(/\\/g, '/')),
                        includePath: includePath,
                        pathRelativeToInclude: Path(file.replace(path.matchFolder(includePath), '').replace(/\\/g, '/')),
                    };
                });
            }

            function getFileNames(filespec) {
                return Files.getFilenames(output.basePath + filespec, recurse());
            }
            
            function prioritise() {
                if (value.prioritise)
                    utils.executeSingleOrArray(value.prioritise, files.prioritise, true);
                
                if (value.first)
                    utils.executeSingleOrArray(value.first, files.prioritise, true);

                if (value.last)
                    utils.executeSingleOrArray(value.last, function(individualFile) {
                        files.prioritise(individualFile, true);
                    });
            }

            function recurse() {
                return value.recursive === true || (output.transforms.recursive === true && value.recursive !== false);
            }
        }
    }

    function formatInclude(include, output) {
        if(_.isFunction(include))
            include = include(output);        
        include = include || {};
        
        if (include.constructor === String)
            return include;
        if (include.files)
            return include.files;
        if (include.constructor === Array)
            return _.map(include, function(include) {
                return formatInclude(include, output);
            }).join(', ');
        return include.toString();
    }
})();

