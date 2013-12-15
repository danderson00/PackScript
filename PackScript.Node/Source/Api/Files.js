(function () {
    var fs = require('fs');

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
        copyFile: function (from, to) {
            this.writeFile(to, this.getFileContents(from));
        },
        excludedDirectories: ['csx', 'bin', 'obj']
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
