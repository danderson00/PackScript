(function () {
    module("transforms.files", { setup: filesAsSpy });

    test("include calls getFilenames with correct arguments when string is passed", function () {
        pack.transforms.include.func('*.js', new Pack.Output({ recursive: true }, 'path/'));
        ok(Files.getFilenames.calledOnce);
        ok(Files.getFilenames.calledWithExactly('path/*.js', true));
    });

    test("include calls getFilenames with correct arguments when object is passed", function () {
        pack.transforms.include.func({ files: '*.js', recursive: false }, new Pack.Output({ recursive: true }, 'path/'));
        ok(Files.getFilenames.calledOnce);
        ok(Files.getFilenames.calledWithExactly('path/*.js', false));
    });

    test("include calls getFilenames with correct arguments when function is passed and no list exists", function () {
        pack.transforms.include.func(function () { }, new Pack.Output({ recursive: true }, 'path/'));
        ok(Files.getFilenames.calledOnce);
        ok(Files.getFilenames.calledWithExactly('path/*.*', true));
    });

    test("include calls getFilenames twice when two values are passed", function() {
        pack.transforms.include.func(['*.js', { files: '*.txt', recursive: true }], new Pack.Output({ }, 'path/'));
        ok(Files.getFilenames.calledTwice);
        ok(Files.getFilenames.calledWithExactly('path/*.js', false));
        ok(Files.getFilenames.calledWithExactly('path/*.txt', true));
    });

    test("setting template include option overrides template transform value", function() {
        var data = new Pack.Output({ template: 'test1' }, 'path/');
        Files.getFilenames = sinon.stub().returns(['file']);
        pack.transforms.include.func([{ template: 'test2' }], data);
        equal(data.files.list.length, 1);
        equal(data.files.list[0].template, 'test2');
    });

    test("prioritise mvoes single file to top of file list", function () {
        var data = new Pack.Output({}, 'path/');
        Files.getFilenames = sinon.stub().returns(['file1', 'file2', 'file3']);
        pack.transforms.include.func({ prioritise: 'file2' }, data);
        equal(data.files.list.length, 3);
        equal(data.files.list[0].path, 'file2');
        equal(data.files.list[1].path, 'file1');
        equal(data.files.list[2].path, 'file3');
    });

    test("prioritise mvoes array of files to top of file list", function () {
        var data = new Pack.Output({}, 'path/');
        Files.getFilenames = sinon.stub().returns(['file1', 'file2', 'file3']);
        pack.transforms.include.func({ prioritise: ['file3', 'file2'] }, data);
        equal(data.files.list.length, 3);
        equal(data.files.list[0].path, 'file3');
        equal(data.files.list[1].path, 'file2');
        equal(data.files.list[2].path, 'file1');
    });
})();
