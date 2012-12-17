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

