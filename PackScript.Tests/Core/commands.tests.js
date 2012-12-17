(function () {
    var p;
    
    module("commands", { setup: setup });

    test("build recurses when output path matches other outputs", function () {
        Files.getFilenames = getFilenames;
        Files.getFileContents = getFileContents;
        var parent = p.addOutput({ include: 'parent', to: 'child' }, '');
        var child = p.addOutput({ include: 'child', to: 'output' }, '');
        var spy = sinon.spy();
        child.build = spy;

        p.all();
        ok(spy.calledOnce);

        function getFilenames(name) {
            return name === 'parent' ? ['parent'] : ['child'];
        }

        function getFileContents(files) {
            return files[0] === 'parent' ? { 'parent': 'parent' } : { 'child': 'child' };
        }
    });

    test("fileChanged updates config when called with config path", function() {
        Files.files['/test/test.pack.js'] = 'Test= "test"';
        p.scanForConfigs('/');
        equal(Test, 'test');
        Files.files['/test/test.pack.js'] = 'Test = "test2"';
        p.fileChanged('/test/test.pack.js');
        equal(Test, 'test2');
    });

    function setup() {
        filesAsMock();
        p = new Pack();
    }
})();
