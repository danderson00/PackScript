(function () {
    var utils = Pack.utils;
    var transforms = pack.transforms;
    
    transforms.add('include', 'includeFiles', function (data) {
        if(data.options.log !== false)
            Log.debug('Including ' + data.value + ' in ' + (data.output.transforms && data.output.transforms.to));
        data.target.files.include(loadFileList(data.value, data.output));
    });
    
    transforms.add('exclude', 'excludeFiles', function (data) {
        if (data.options.log !== false)
            Log.debug('Excluding ' + data.value + ' from ' + (data.output.transforms && data.output.transforms.to));
        data.target.files.exclude(loadFileList(data.value, data.output));
    });

    function loadFileList(allValues, output) {
        var allFiles = new FileList();
        utils.executeSingleOrArray(allValues, recurseValues);
        return allFiles;

        function recurseValues(value) {
            if (_.isArray(value))
                return utils.executeSingleOrArray(value, recurseValues);
            else
                allFiles.include(loadIndividualFileList(value));
        }

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
                        template: value.template,
                        filespec: filespec
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
})();

