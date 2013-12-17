Pack.transforms.combine = {
    event: 'output',
    apply: function(data, pack) {
        var target = data.target;
        var output = data.output;

        log();
        target.output = _.pluck(target.files.list, 'content').join('');

        function log() {
            Pack.api.Log.debug('(' + filenames() + ') -> ' + (output.transforms && output.transforms.to));
            if (target.files.list.length === 0)
                Pack.api.Log.warn('No files to include for ' + (output.transforms && output.transforms.to));
        }

        function filenames() {
            return _.map(target.files.paths(), function(path) {
                return Path(path).filename();
            }).join(', ');
        }
    }
};

