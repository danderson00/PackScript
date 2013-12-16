(function() {
    QUnit.module('Integration.Files', { setup: filesAsOriginal });

    test("getFilenames returns array of files in specified folder", function() {
        var files = Pack.api.Files.getFilenames(fullPath('*.*'));
        equal(files.length, 1);
        equal(files[0], fullPath('root.txt'));
    });

    test("getFilenames recurses when specified", function() {
        var files = Pack.api.Files.getFilenames(fullPath('*.*'), true);
        equal(files.length, 2);
        equal(files[0], fullPath('root.txt'));
        equal(files[1], fullPath('Child/child.txt'));
    });

    test("getFileContents returns string contents of specified file", function() {
        equal(Pack.api.Files.getFileContents(fullPath('root.txt')), 'root');
    });

    test("getFileContents returns hash of path to string contents for specified array of files", function() {
        var contents = Pack.api.Files.getFileContents([fullPath('root.txt'), fullPath('Child/child.txt')]);
        equal(contents[fullPath('root.txt')], 'root');
        equal(contents[fullPath('Child/child.txt')], 'child');
    });

    test("writeFile writes specified string to target file", function() {
        var value = _.random(1, 10);
        Pack.api.Files.writeFile(fullPath('test.txt'), value);
        equal(Pack.api.Files.getFileContents(fullPath('test.txt')), value);
        require('fs').unlinkSync(fullPath('test.txt'));
    });

    test("copyFile copies specified source file to target", function() {
        var value = _.random(1, 10);
        Pack.api.Files.copyFile(fullPath('root.txt'), fullPath(value));
        equal(Pack.api.Files.getFileContents(fullPath(value)), 'root');
        require('fs').unlinkSync(fullPath(value));
    });
    
    function fullPath(path) {
        return 'Tests/Integration/Files/' + path;
    }
})();
