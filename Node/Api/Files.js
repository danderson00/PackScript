(function () {
    var fs = require('fs-extra');

    Pack.api.Files = {
        getFilenames: function (filespec, recursive) {
            return Pack.utils.listTree(filespec, recursive);
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
            try {
                return fs.writeFileSync(path, content);
            } catch(ex) {
                Pack.api.Log.error('Error writing to ' + path, ex);
            }
        },
        copy: function (from, to) {
            try {
                fs.mkdirpSync(Path(to).withoutFilename().toString());
                fs.copySync(from, to);
            } catch (ex) {
                Pack.api.Log.error('Error copying from ' + from + ' to ' + to, ex);
            }
        },
        remove: function (directory) {
            try {
                fs.removeSync(directory);
            } catch (ex) {
                Pack.api.Log.error('Error removing directory ' + directory, ex);
            }
        },
        excludedDirectories: ['csx', 'obj']
    };

    function readFile(path) {
        try {
            var content = fs.readFileSync(path, 'utf8');
            if (content.charCodeAt(0) == 65279)
                return content.substring(1);
            return content;
        } catch (ex) {
            Pack.api.Log.error('Error reading from ' + path, ex);
        }
    }
})();
