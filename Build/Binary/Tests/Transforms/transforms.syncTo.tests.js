(function () {
    QUnit.module("transforms.syncTo", { setup: filesAsSpy });

    var data = {
        files: {
            list: [
                { path: '/path/to1/file1', pathRelativeToInclude: 'to1/file1' },
                { path: '/path/to2/file2', pathRelativeToInclude: 'to2/file2' }
            ],
            paths: function () { }
        }
    };

    test("syncTo executes copyFile for each file in list", function () {
        Pack.transforms.syncTo.apply(wrap('target/path', new Pack.Output({}, 'path/'), data));
        ok(Pack.api.Files.copyFile.calledTwice);
        deepEqual(Pack.api.Files.copyFile.firstCall.args, ['/path/to1/file1', 'path/target/path/to1/file1']);
        deepEqual(Pack.api.Files.copyFile.secondCall.args, ['/path/to2/file2', 'path/target/path/to2/file2']);
    });

    test("syncTo handles absolute paths", function() {
        Pack.transforms.syncTo.apply(wrap('/target/path/', new Pack.Output({}, 'path/'), data));
        ok(Pack.api.Files.copyFile.calledTwice);
        deepEqual(Pack.api.Files.copyFile.firstCall.args, ['/path/to1/file1', 'path/target/path/to1/file1']);
        deepEqual(Pack.api.Files.copyFile.secondCall.args, ['/path/to2/file2', 'path/target/path/to2/file2']);
    });
})();
