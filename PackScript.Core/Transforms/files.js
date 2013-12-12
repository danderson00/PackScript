(function () {
    var utils = Pack.utils;
    var transforms = Pack.transforms;
    
    transforms.prioritise = { event: 'includeFiles', func: first };
    transforms.first = { event: 'includeFiles', func: first };
    transforms.last = { event: 'includeFiles', func: last };
    
    function first(data) {
        utils.executeSingleOrArray(data.value, data.target.files.prioritise);
    }
    
    function last(data) {
        utils.executeSingleOrArray(data.value, function (value) {
            data.target.files.prioritise(value, true);
        });
    }

    transforms.excludeDefaults = {
        event: 'excludeFiles',
        apply: function(data) {
            data.target.files.exclude(data.output.outputPath);
            if (!data.output.transforms.includeConfigs)
                data.target.files.exclude(pack.loadedConfigs);

        }
    };
})();

