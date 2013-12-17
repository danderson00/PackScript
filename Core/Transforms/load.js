Pack.transforms.load = {
    event: 'content',
    apply: function(data, pack) {
        var target = data.target;
        var output = data.output;
        var Files = Pack.api.Files;
        var Log = Pack.api.Log;

        var fileContents = Files.getFileContents(target.files.paths());

        target.files.setProperty('content', fileContents);

        var fileCount = target.files && _.keys(target.files.list).length;
        Log.debug(fileCount ?
            'Loaded content for ' + fileCount + ' files for ' + (output.transforms && output.transforms.to) :
            'No content to load for ' + (output.transforms && output.transforms.to));
    }
};

