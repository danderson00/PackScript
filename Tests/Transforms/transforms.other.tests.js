(function () {
    QUnit.module("transforms.content", { setup: filesAsSpy });

    test("load calls getFileContents passing file names", function () {
        Pack.transforms.load.apply(wrap(true, {}, { files: new Pack.FileList('1', '3') }));
        ok(Pack.api.Files.getFileContents.calledOnce);
        deepEqual(Pack.api.Files.getFileContents.firstCall.args[0], ['1', '3']);
    });
    

    QUnit.module("transforms.output", { setup: filesAsSpy });

    test("combine joins all files contents", function () {
        var data = { files: new Pack.FileList({ path: 'file1', content: '1' }, { path: 'file2', content: '2' }, { path: 'file3', content: '3' }) };
        Pack.transforms.combine.apply(wrap(true, {}, data));
        equal(data.output, '123');
    });


    QUnit.module("transforms.finalise", { setup: filesAsSpy });

    test("write calls writeFile with correct arguments", function () {
        var output = new Pack.Output({ to: '../test.txt' }, 'C:\\temp\\');
        var data = { output: 'test' };
        Pack.transforms.to.apply(wrap(true, output, data));
        ok(Pack.api.Files.writeFile.calledOnce);
        ok(Pack.api.Files.writeFile.calledWithExactly('C:\\test.txt', 'test'));
    });
})();
