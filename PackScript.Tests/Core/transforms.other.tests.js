(function () {
    module("transforms.content", { setup: filesAsSpy });

    test("load calls getFileContents passing file names", function () {
        pack.transforms.load.func(true, { files: new FileList('1', '3') });
        ok(Files.getFileContents.calledOnce);
        deepEqual(Files.getFileContents.firstCall.args[0], ['1', '3']);
    });

    test("load excludes config files", function () {
        pack.loadedConfigs = ['3'];
        pack.transforms.load.func(true, { files: new FileList('1', '3') });
        ok(Files.getFileContents.calledOnce);
        deepEqual(Files.getFileContents.firstCall.args[0], ['1']);
    });

    test("load excludes output file", function () {
        pack.transforms.load.func(true, { files: new FileList('1', '3'), outputPath: '3' });
        ok(Files.getFileContents.calledOnce);
        deepEqual(Files.getFileContents.firstCall.args[0], ['1']);
    });


    module("transforms.output", { setup: filesAsSpy });

    test("combine joins all files contents", function () {
        var data = { files: new FileList({ path: 'file1', content: '1' }, { path: 'file2', content: '2' }, { path: 'file3', content: '3' }) };
        pack.transforms.combine.func(true, data);
        equal(data.output, '123');
    });


    module("transforms.finalise", { setup: filesAsSpy });

    test("write calls writeFile with correct arguments", function () {
        var output = new Pack.Output({ to: '../test.txt' }, 'C:\\temp\\');
        output.output = 'test';
        pack.transforms.to.func(true, output);
        ok(Files.writeFile.calledOnce);
        ok(Files.writeFile.calledWithExactly('C:\\test.txt', 'test'));
    });
})();
