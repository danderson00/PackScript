(function () {
    pack.transforms.add('to', 'finalise', function (value, output) {
        var path = Path(output.basePath + output.transforms.to);
        Files.writeFile(path.toString(), output.output);
        Log.info('Wrote file ' + path);
        clean(output);
    });
    
    function clean(output) {
        delete output.output;
        _.each(output.files.list, function(file) {
            delete file.content;
        });
    }
})();

