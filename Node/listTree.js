Pack.utils.listTree = function(filespec, recursive) {
    var fs = require('fs');

    filespec = Path(filespec);

    var filter = filespec.filename().toString() || '*.*';
    var basePath = filespec.withoutFilename().toString() || './';
    var paths = [];
    var childDirectories = [];

    try {
        var children = fs.readdirSync(basePath);

        children.forEach(function(child) {
            var fullChild = basePath + child;

            try {
                var stat = fs.statSync(fullChild);
                if (!stat.isDirectory() && Path(fullChild).match(filespec))
                    paths.push(fullChild);

                if (stat.isDirectory() && recursive && Pack.api.Files.excludedDirectories.indexOf(child) === -1)
                    childDirectories.push(fullChild);
            } catch(ex) {
                Pack.api.Log.error('Error getting file information for ' + fullChild, ex);
            }
        });
    } catch(ex) {
        Pack.api.Log.error('Error getting directory contents from ' + basePath, ex);
    }

    // we want to process child directories after the directory contents
    childDirectories.forEach(function(child) {
        paths.push.apply(paths, Pack.utils.listTree(child + '/' + filter, recursive));
    });

    return paths;
};
