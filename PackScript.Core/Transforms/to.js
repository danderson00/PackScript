pack.transforms.add('to', 'finalise', function (data) {
    var path = Path(data.output.basePath + data.output.transforms.to);
    Files.writeFile(path.toString(), data.target.output);
    Log.info('Wrote file ' + path);

    // this is a bit nasty
    data.output.currentPaths = data.target.files && data.target.files.paths();
});

