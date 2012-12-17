(function () {
    module("Output", { setup: filesAsMock });

    test("build creates full output", function() {
        Files.files = {
            'test.js': 'var test = "test";'
        };
        var output = new Pack.Output({ to: "output.js", include: "test.js" }, "path/").build().output;
        equal(output, 'var test = "test";');
    });

    test("matches returns true if file list contains file", function() {
        var output = new Pack.Output({}, '');
        output.files = new FileList('1', '1', '2', '3');
        ok(output.matches('2'));
    });

    test("matchingOutputs returns array of outputs matching file", function() {
        var p = new Pack();
        createOutput('1', '1', '2', '3');
        createOutput('2', '1', '2');
        createOutput('3', '2');
        equal(p.matchingOutputs('1').length, 2);
        equal(p.matchingOutputs('2').length, 3);
        equal(p.matchingOutputs('3').length, 1);

        function createOutput(name) {
            var output = p.addOutput({ to: name }, '');
            output.files = new FileList();
            output.files.include(_.toArray(arguments).slice(1));
            return output;
        }
    });

    test("cleanConfig removes outputs with matching config file", function() {
        var p = new Pack();
        p.outputs = [{ configPath: 'config' }, { configPath: 'config' }, { configPath: 'config2' }];
        p.cleanConfig('config');
        equal(p.outputs.length, 1);
    });

    test("configOutputs returns all outputs with specified configPath", function() {
        var p = new Pack();
        p.outputs = [{ configPath: 'config' }, { configPath: 'config' }, { configPath: 'config2' }];
        var outputs = p.configOutputs('config');
        equal(outputs.length, 2);
    });
})();
