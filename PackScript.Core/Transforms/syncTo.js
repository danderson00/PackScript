pack.transforms.add('zipTo', 'finalise', function (data) {
    var path = Path(data.output.basePath + data.value).toString();
    Zip.archive(path, data.output.basePath, data.target.files.paths());
    Log.info('Wrote file ' + path);

    // this is a bit nasty
    data.output.currentPaths = data.target.files && data.target.files.paths();
});

