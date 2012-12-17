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

