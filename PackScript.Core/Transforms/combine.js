(function () {
    pack.transforms.add('combine', 'output', function (data) {
        var target = data.target;
        var output = data.output;
        
        log();
        target.output = _.pluck(target.files.list, 'content').join('');
        
        function log() {
            if (data.options.log !== false) {
                if (Pack.options.logLevel === 'debug')
                    Log.debug('(' + filenames() + ') -> ' + (output.transforms && output.transforms.to));
                if (target.files.list.length === 0)
                    Log.warn('No files to include for ' + (output.transforms && output.transforms.to));
            }

        }
        
        function filenames() {
            return _.map(target.files.paths(), function (path) {
                return Path(path).filename();
            }).join(', ');;
        }
    });
})();

