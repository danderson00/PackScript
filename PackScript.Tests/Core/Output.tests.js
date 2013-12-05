(function () {
    QUnit.module("Output", { setup: filesAsMock });

    test("matches returns true if file list contains file", function() {
        var output = new Pack.Output({ include: '*.*' }, '');
        Files.files = ['1', '1', '2', '3'];
        ok(output.matches('2', pack.transforms));
    });

    test("matchingOutputs returns array of outputs matching file", function() {
        var p = new Pack();
        createOutput('1', true);
        createOutput('2', true);
        createOutput('3', false);
        equal(p.matchingOutputs().length, 2);

        function createOutput(name, matches) {
            var output = p.addOutput({ to: name }, '');
            output.matches = function() {
                return matches;
            };
        }
    });

    test("removeConfigOutputs removes outputs with matching config file", function() {
        var p = new Pack();
        p.outputs = [{ configPath: 'config' }, { configPath: 'config' }, { configPath: 'config2' }];
        p.removeConfigOutputs('config');
        equal(p.outputs.length, 1);
    });

    test("configOutputs returns all outputs with specified configPath", function() {
        var p = new Pack();
        p.outputs = [{ configPath: 'config' }, { configPath: 'config' }, { configPath: 'config2' }];
        var outputs = p.configOutputs('config');
        equal(outputs.length, 2);
    });

    test("executeTransform executes the appropriate transform", function () {
        expect(1);
        var output = new Pack.Output({ test: 'value' }, '', pack.transforms);
        pack.transforms.add('test', '', function(value) {
            equal(value, 'value');
        });
        pack.executeTransform('test', output);
    });
})();
