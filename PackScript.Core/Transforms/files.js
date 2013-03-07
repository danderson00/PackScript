(function () {
    var utils = Pack.utils;
    var transforms = pack.transforms;
    
    transforms.add('prioritise', 'includeFiles', first);
    transforms.add('first', 'includeFiles', first);
    transforms.add('last', 'includeFiles', last);
    
    function first(data) {
        utils.executeSingleOrArray(data.value, data.target.files.prioritise);
    }
    
    function last(data) {
        utils.executeSingleOrArray(data.value, function (value) {
            data.target.files.prioritise(value, true);
        });
    }

    transforms.add('excludeDefaults', 'excludeFiles', function (data) {
        data.target.files
            .exclude(pack.loadedConfigs)
            .exclude(data.output.outputPath);
    });
})();

