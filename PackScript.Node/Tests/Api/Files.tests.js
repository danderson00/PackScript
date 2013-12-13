QUnit.module('Api.Files');

test("getFilenames returns array of files in specified folder", function() {
    var files = Pack.api.Files.getFilenames('Tests/Api/Files/*.*');
    equal(files.length, 1);
    equal(files[0], 'Tests/Api/Files/root.txt');
});

test("getFilenames recurses when specified", function () {
    var files = Pack.api.Files.getFilenames('Tests/Api/Files/*.*', true);
    equal(files.length, 2);
    equal(files[0], 'Tests/Api/Files/root.txt');
    equal(files[1], 'Tests/Api/Files/Child/child.txt');
});

test("getFileContents returns string contents of specified file", function() {
    equal(Pack.api.Files.getFileContents('Tests/Api/Files/root.txt'), 'root');
});

test("getFileContents returns hash of path to string contents for specified array of files", function () {
    var contents = Pack.api.Files.getFileContents(['Tests/Api/Files/root.txt', 'Tests/Api/Files/Child/child.txt']);
    equal(contents['Tests/Api/Files/root.txt'], 'root');
    equal(contents['Tests/Api/Files/Child/child.txt'], 'child');
});

test("writeFile writes specified string to target file", function () {
    var value = _.random(1, 10);
    Pack.api.Files.writeFile('Tests/Api/Files/test.txt', value);
    equal(Pack.api.Files.getFileContents('Tests/Api/Files/test.txt'), value);
    require('fs').unlinkSync('Tests/Api/Files/test.txt');
});

test("copyFile copies specified source file to target", function () {
    var value = _.random(1, 10);
    Pack.api.Files.copyFile('Tests/Api/Files/root.txt', 'Tests/Api/Files/' + value);
    equal(Pack.api.Files.getFileContents('Tests/Api/Files/' + value), 'root');
    require('fs').unlinkSync('Tests/Api/Files/' + value);
});