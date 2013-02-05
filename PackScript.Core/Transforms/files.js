(function () {
    var utils = Pack.utils;
    var transforms = pack.transforms;
    
    transforms.add('prioritise', 'includeFiles', function (data) {
        utils.executeSingleOrArray(data.value, data.target.files.prioritise);
    });

    transforms.add('excludeDefaults', 'excludeFiles', function(data) {
        data.target.files
            .exclude(pack.loadedConfigs)
            .exclude(data.output.outputPath);
    });
})();

