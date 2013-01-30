(function () {
    pack.transforms.add('load', 'content', function (value, output) {
        output.files.exclude(pack.loadedConfigs).exclude(output.outputPath);
        
        var fileContents = Files.getFileContents(output.files.paths());
        output.files.setProperty('content', fileContents);

        var fileCount = output.files && _.keys(output.files.list).length;
        Log.debug(fileCount ? 
            'Loaded content for ' + fileCount + ' files for ' + (output.transforms && output.transforms.to) :
            'No content to load for ' + (output.transforms && output.transforms.to));
    });
})();

