(function () {
    var fs = require('fs');

    Files = {
        getFilenames: function (filespec, recursive) {
            filespec = Path(filespec);
            if (recursive)
                fs.listTree(filespec.withoutFilename().toString(), function (path) {
                    return filespec.matches(path);
                });
        },
        getFileContents: function (files) {

        },
        writeFile: function (path, content) {

        },
        copyFile: function (from, to) {

        }
    };

    function listTree(filespec, recursive) {
        var self = this;
        filespec = Path(filespec || './*.*');
        
        var basePath = filespec.withoutFilename();
        var stat = fs.statSync(basePath);
        var paths = [];
        
        var include = filespec.matches(basePath);

        if (include)
            paths.push([basePath]);
        
        if (recursive && stat.isDirectory()) {
            var children = fs.readdirSync(basePath.toString());
            paths.push.apply(paths, children.map(function (child) {
                var path = basePath.combine(child + '/*.*');
                return self.listTree(path);
            }));
        }
        
        return paths;
    }
})();
