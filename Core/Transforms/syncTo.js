Pack.transforms.syncTo = {
    event: 'finalise',
    apply: function(data, pack) {
        var Files = Pack.api.Files;
        var Log = Pack.api.Log;

        var targetFolder = Path(data.output.basePath + data.value + '/');
        var files = data.target.files.list;

        _.each(files, function(file) {
            Files.copyFile(file.path.toString(), targetFolder + file.pathRelativeToInclude);
        });

        Log.info('Copied ' + files.length + ' files to ' + targetFolder);

        // this should be moved to a separate transform. It is consumed by Output.matches
        data.output.currentPaths = data.target.files && data.target.files.paths();
    }
};

