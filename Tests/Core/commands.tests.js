(function () {
    var p;
    
    QUnit.module("commands", { setup: setup });

    test("build writes full output", function () {
        Pack.api.Files.files = {
            'test.js': 'var test = "test";'
        };
        Pack.api.Files.writeFile = sinon.spy();
        var output = new Pack.Output({ to: "output.js", include: "test.js" }, "path/");
        p.build(output);
        ok(Pack.api.Files.writeFile.calledOnce);
        equal(Pack.api.Files.writeFile.firstCall.args[1], 'var test = "test";');
        //equal(output.output, 'var test = "test";');
    });

    test("build recurses when output path matches other outputs", function () {
        Pack.api.Files.getFilenames = getFilenames;
        Pack.api.Files.getFileContents = getFileContents;
        p.addOutput({ include: 'parent', to: 'child' }, '');
        p.addOutput({ include: 'child', to: 'output' }, '');
        var spy = sinon.spy();
        p.transforms.applyTo = spy;

        p.all();
        equal(spy.callCount, 3);

        function getFilenames(name) {
            return name === 'parent' ? ['parent'] : ['child'];
        }

        function getFileContents(files) {
            return files[0] === 'parent' ? { 'parent': 'parent' } : { 'child': 'child' };
        }
    });

    test("fileChanged updates config when called with config path", function() {
        Pack.api.Files.files['/test/test.pack.js'] = 'Test= "test"';
        p.scanForConfigs('/');
        equal(Test, 'test');
        Pack.api.Files.files['/test/test.pack.js'] = 'Test = "test2"';
        p.fileChanged('/test/test.pack.js');
        equal(Test, 'test2');
    });

    function setup() {
        p = new Pack({ throttleTimeout: 0 });
        filesAsMock(p);
    }
})();
