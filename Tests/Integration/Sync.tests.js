integrationTest('Sync', function (output) {
    var copy = Pack.api.Files.copy;
    equal(copy.firstCall.args[0], 'Tests/Integration/Sync/test.js');
    equal(copy.firstCall.args[0], fullPath('Sync/test.js'), 'simple');
    equal(copy.firstCall.args[1], fullPath('TestOutput/Sync/Simple/test.js'), 'simple');

    equal(copy.secondCall.args[0], fullPath('Sync/Child/test.js'), 'child');
    equal(copy.secondCall.args[1], fullPath('TestOutput/Sync/Child/test.js'), 'child');

    equal(copy.thirdCall.args[0], fullPath('Sync/test.js'), 'recursive');
    equal(copy.thirdCall.args[1], fullPath('TestOutput/Sync/Recursive/test.js'), 'recursive');
    equal(copy.getCall(3).args[0], fullPath('Sync/Child/test.js'), 'recursive');
    equal(copy.getCall(3).args[1], fullPath('TestOutput/Sync/Recursive/Child/test.js'), 'recursive');

    equal(copy.getCall(4).args[0], fullPath('Sync/test.js'), 'alternate');
    equal(copy.getCall(4).args[1], fullPath('TestOutput/Sync/Alternate/test.js'), 'alternate');

    equal(copy.getCall(5).args[0], fullPath('Sync/Child/'), 'directory');
    equal(copy.getCall(5).args[1], fullPath('TestOutput/Sync/Directory/'), 'directory');

    equal(copy.getCall(6).args[0], fullPath('Sync/Child/'), 'directoryArray');
    equal(copy.getCall(6).args[1], fullPath('TestOutput/Sync/DirectoryArray/'), 'directoryArray');
    equal(copy.getCall(7).args[0], fullPath('Sync/Child2/'), 'directoryArray');
    equal(copy.getCall(7).args[1], fullPath('TestOutput/Sync/DirectoryArray/'), 'directoryArray');

    function fullPath(path) {
        return 'Tests/Integration/' + path;
    }
});
