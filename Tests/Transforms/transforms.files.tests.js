(function () {
    QUnit.module("transforms.files", { setup: filesAsSpy });

    test("include calls getFilenames with correct arguments when string is passed", function () {
        Pack.transforms.include.apply(wrap('*.js', new Pack.Output({ recursive: true }, 'path/'), new Pack.Container()));
        ok(Pack.api.Files.getFilenames.calledOnce);
        ok(Pack.api.Files.getFilenames.calledWithExactly('path/*.js', true));
    });

    test("include calls getFilenames with correct arguments when object is passed", function () {
        Pack.transforms.include.apply(wrap({ files: '*.js', recursive: false }, new Pack.Output({ recursive: true }, 'path/'), new Pack.Container()));
        ok(Pack.api.Files.getFilenames.calledOnce);
        ok(Pack.api.Files.getFilenames.calledWithExactly('path/*.js', false));
    });

    test("include calls getFilenames with correct arguments when function is passed", function () {
        Pack.transforms.include.apply(wrap(function() { return { files: '*.js', recursive: false }; }, new Pack.Output({ recursive: true }, 'path/'), new Pack.Container()));
        ok(Pack.api.Files.getFilenames.calledOnce);
        ok(Pack.api.Files.getFilenames.calledWithExactly('path/*.js', false));
    });

    test("include calls getFilenames with correct arguments when function is passed and no list exists", function () {
        Pack.transforms.include.apply(wrap(function () { }, new Pack.Output({ recursive: true }, 'path/'), new Pack.Container()));
        ok(Pack.api.Files.getFilenames.calledOnce);
        ok(Pack.api.Files.getFilenames.calledWithExactly('path/*.*', true));
    });

    test("include calls getFilenames twice when two values are passed", function() {
        Pack.transforms.include.apply(wrap(['*.js', { files: '*.txt', recursive: true }], new Pack.Output({}, 'path/'), new Pack.Container()));
        ok(Pack.api.Files.getFilenames.calledTwice);
        ok(Pack.api.Files.getFilenames.calledWithExactly('path/*.js', false));
        ok(Pack.api.Files.getFilenames.calledWithExactly('path/*.txt', true));
    });

    test("include values can be nested recursively", function() {
        Pack.transforms.include.apply(wrap(['*.js', ['*.htm', ['*.css']]], new Pack.Output({}, 'path/'), new Pack.Container()));
        ok(Pack.api.Files.getFilenames.calledThrice);
        ok(Pack.api.Files.getFilenames.calledWithExactly('path/*.js', false));
        ok(Pack.api.Files.getFilenames.calledWithExactly('path/*.htm', false));
        ok(Pack.api.Files.getFilenames.calledWithExactly('path/*.css', false));
    });

    test("include sets config and include path values", function() {
        Pack.api.Files.getFilenames = sinon.stub().returns(['path/subfolder/file']);
        var output = new Pack.Output({}, 'path/');
        var data = new Pack.Container();
        Pack.transforms.include.apply(wrap('subfolder/*.js', output, data));
        equal(data.files.list.length, 1);
        equal(data.files.list[0].includePath.toString(), 'path/subfolder/');
        equal(data.files.list[0].pathRelativeToInclude.toString(), 'file');
        equal(data.files.list[0].configPath.toString(), 'path/');
        equal(data.files.list[0].pathRelativeToConfig.toString(), 'subfolder/file');
    });

    test("setting template include option overrides template transform value", function() {
        Pack.api.Files.getFilenames = sinon.stub().returns(['file']);
        var output = new Pack.Output({ template: 'test1' }, 'path/');
        var data = new Pack.Container();
        Pack.transforms.include.apply(wrap([{ template: 'test2' }], output, data));
        equal(data.files.list.length, 1);
        equal(data.files.list[0].template, 'test2');
    });

    test("prioritise moves single file to top of file list", function () {
        var output = new Pack.Output({}, 'path/');
        var data = new Pack.Container();
        Pack.api.Files.getFilenames = sinon.stub().returns(['file1', 'file2', 'file3']);
        Pack.transforms.include.apply(wrap({ prioritise: 'file2' }, output, data));
        equal(data.files.list.length, 3);
        equal(data.files.list[0].path, 'file2');
        equal(data.files.list[1].path, 'file1');
        equal(data.files.list[2].path, 'file3');
    });

    test("prioritise moves array of files to top of file list", function () {
        Pack.api.Files.getFilenames = sinon.stub().returns(['file1', 'file2', 'file3']);
        var output = new Pack.Output({}, 'path/');
        var data = new Pack.Container();
        Pack.transforms.include.apply(wrap({ prioritise: ['file3', 'file2'] }, output, data));
        
        equal(data.files.list.length, 3);
        equal(data.files.list[0].path, 'file3');
        equal(data.files.list[1].path, 'file2');
        equal(data.files.list[2].path, 'file1');
    });
    
    test("first is an alias for prioritise", function () {
        equal(Pack.transforms.first.apply, Pack.transforms.prioritise.apply);
    });

    test("last moves single file to bottom of file list", function () {
        var output = new Pack.Output({}, 'path/');
        var data = new Pack.Container();
        Pack.api.Files.getFilenames = sinon.stub().returns(['file1', 'file2', 'file3']);
        Pack.transforms.include.apply(wrap({ last: 'file2' }, output, data));
        equal(data.files.list.length, 3);
        equal(data.files.list[0].path, 'file1');
        equal(data.files.list[1].path, 'file3');
        equal(data.files.list[2].path, 'file2');
    });

    test("last moves array of files to bottom of file list", function () {
        Pack.api.Files.getFilenames = sinon.stub().returns(['file1', 'file2', 'file3']);
        var output = new Pack.Output({}, 'path/');
        var data = new Pack.Container();
        Pack.transforms.include.apply(wrap({ last: ['file1', 'file2'] }, output, data));

        equal(data.files.list.length, 3);
        equal(data.files.list[0].path, 'file3');
        equal(data.files.list[1].path, 'file1');
        equal(data.files.list[2].path, 'file2');
    });

    test("excludeDefaults excludes config files", function () {
        var data = { files: new Pack.FileList('1', '3') };
        Pack.transforms.excludeDefaults.apply(wrap(true, { transforms: {} }, data), { loadedConfigs: ['3'] });
        equal(data.files.list.length, 1);
        equal(data.files.list[0].path, '1');
    });

    test("excludeDefaults includes config files if includeConfigs transform is specified", function() {
        var data = { files: new Pack.FileList('1', '3') };
        Pack.transforms.excludeDefaults.apply(wrap(true, { transforms: { includeConfigs: true } }, data), { loadedConfigs: ['3'] });
        equal(data.files.list.length, 2);
    });
    
    test("excludeDefaults excludes output file", function () {
        var data = { files: new Pack.FileList('1', '3') };
        Pack.transforms.excludeDefaults.apply(wrap(true, { outputPath: '3', transforms: { } }, data), {});
        equal(data.files.list.length, 1);
        equal(data.files.list[0].path, '1');
    });

})();
