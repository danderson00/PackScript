integrationTest('Sync', function (output) {
    var copyFile = Pack.api.Files.copyFile;
    equal(copyFile.firstCall.args[0], 'Tests/Integration/Sync/test.js');
    equal(copyFile.firstCall.args[0], fullPath('Sync/test.js'), 'simple');
    equal(copyFile.firstCall.args[1], fullPath('TestOutput/Sync/Simple/test.js'), 'simple');

    equal(copyFile.secondCall.args[0], fullPath('Sync/Child/test.js'), 'child');
    equal(copyFile.secondCall.args[1], fullPath('TestOutput/Sync/Child/test.js'), 'child');

    equal(copyFile.thirdCall.args[0], fullPath('Sync/test.js'), 'recursive');
    equal(copyFile.thirdCall.args[1], fullPath('TestOutput/Sync/Recursive/test.js'), 'recursive');
    equal(copyFile.getCall(3).args[0], fullPath('Sync/Child/test.js'), 'recursive');
    equal(copyFile.getCall(3).args[1], fullPath('TestOutput/Sync/Recursive/Child/test.js'), 'recursive');

    equal(copyFile.getCall(4).args[0], fullPath('Sync/test.js'), 'alternate');
    equal(copyFile.getCall(4).args[1], fullPath('TestOutput/Sync/Alternate/test.js'), 'alternate');

    function fullPath(path) {
        return 'Tests/Integration/' + path;
    }
});
