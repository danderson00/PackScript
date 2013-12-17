(function () {
    var utils = Pack.utils;
    var transforms = Pack.transforms;
    
    transforms.prioritise = { event: 'includeFiles', apply: first };
    transforms.first = { event: 'includeFiles', apply: first };
    transforms.last = { event: 'includeFiles', apply: last };
    
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
        apply: function(data, pack) {
            data.target.files.exclude(data.output.outputPath);
            if (!data.output.transforms.includeConfigs)
                data.target.files.exclude(pack.loadedConfigs);

        }
    };
})();

