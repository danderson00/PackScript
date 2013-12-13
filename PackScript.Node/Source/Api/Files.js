(function () {
    var fs = require('fs');

    Pack.api.Files = {
        getFilenames: function (filespec, recursive) {
            return listTree(filespec, recursive);
        },
        getFileContents: function (files) {
            if (files.constructor === Array)
                return files.reduce(function (result, file) {
                    result[file] = readFile(file);
                    return result;
                }, {});
            else
                return readFile(files);
        },
        writeFile: function (path, content) {
            return fs.writeFileSync(path, content);
        },
        copyFile: function (from, to) {
            this.writeFile(to, this.getFileContents(from));
        }
    };
    
    function readFile(path) {
        var content = fs.readFileSync(path, 'utf8');
        if (content.charCodeAt(0) == 65279)
            return content.substring(1);
        return content;
    }

    function listTree(filespec, recursive) {
        filespec = Path(filespec || './*.*');

        var filter = filespec.filename().toString();
        var basePath = filespec.withoutFilename().toString();
        var paths = [];
        var childDirectories = [];
        
        var children = fs.readdirSync(basePath);

        children.forEach(function (child) {
            var fullChild = basePath + child;
            var stat = fs.statSync(fullChild);

            if (!stat.isDirectory() && Path(fullChild).match(filespec))
                paths.push(fullChild);

            if (stat.isDirectory() && recursive)
                childDirectories.push(fullChild);
        });

        // we want to process child directories after the directory contents
        childDirectories.forEach(function(child) {
            paths.push.apply(paths, listTree(child + '/' + filter));
        });
        
        return paths;
    }
})();
