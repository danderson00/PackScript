(function () {
    module("transforms.content", { setup: filesAsSpy });

    test("load calls getFileContents passing file names", function () {
        pack.transforms.load.apply(wrap(true, {}, { files: new FileList('1', '3') }));
        ok(Files.getFileContents.calledOnce);
        deepEqual(Files.getFileContents.firstCall.args[0], ['1', '3']);
    });
    

    module("transforms.output", { setup: filesAsSpy });

    test("combine joins all files contents", function () {
        var data = { files: new FileList({ path: 'file1', content: '1' }, { path: 'file2', content: '2' }, { path: 'file3', content: '3' }) };
        pack.transforms.combine.apply(wrap(true, {}, data));
        equal(data.output, '123');
    });


    module("transforms.finalise", { setup: filesAsSpy });

    test("write calls writeFile with correct arguments", function () {
        var output = new Pack.Output({ to: '../test.txt' }, 'C:\\temp\\');
        var data = { output: 'test' };
        pack.transforms.to.apply(wrap(true, output, data));
        ok(Files.writeFile.calledOnce);
        ok(Files.writeFile.calledWithExactly('C:\\test.txt', 'test'));
    });
})();
