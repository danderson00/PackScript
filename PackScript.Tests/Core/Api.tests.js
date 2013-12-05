(function () {
    var api;
    
    QUnit.module('Api', {
        setup: function () { api = new Pack.Api(); }
    });

    test("pack converts strings to include transform", function () {
        api.pack('*.js');
        equal(api.pack.outputs.length, 1);
        equal(api.pack.outputs[0].transforms.include, '*.js');
    });

    test("pack converts arrays to include transform", function () {
        var files = ['*.js', '*.txt'];
        api.pack(files);
        equal(api.pack.outputs.length, 1);
        equal(api.pack.outputs[0].transforms.include, files);
    });

    test("pack returns wrapper object when passed a string", function() {
        var wrapper = api.pack('*.*');
        ok(wrapper.to);
        equal(wrapper.output.transforms.include, '*.*');
    });

    test("pack returns wrapper object when passed an object", function() {
        var wrapper = api.pack({ to: 'target' });
        ok(wrapper.to);
        equal(wrapper.output.transforms.to, 'target');
    });

    test("pack returns array of wrapper objects when passed multiple arguments", function () {
        var wrappers = api.pack({}, {});
        equal(wrappers.length, 2);
        ok(wrappers[0].to);
        ok(wrappers[1].to);
    });

    test("pack.to adds single target when passed a string", function() {
        api.pack('*.js').to('output.js');
        equal(api.pack.outputs.length, 1);
        equal(api.pack.outputs[0].transforms.to, 'output.js');
    });

    test("pack.to adds an output for each target", function () {
        api.pack({}).to({ '1': {}, '2': {} });
        equal(api.pack.outputs.length, 2);
    });

    test("pack.to sets 'to' transform from object key", function () {
        api.pack({}).to({ '1': {} });
        equal(api.pack.outputs[0].transforms.to, '1');
    });

    test("pack.to merges transforms from each target", function () {
        api.pack({ '1': 1 }).to({ target1: { '2': 2 }, target2: { '3': 3 } });
        equal(api.pack.outputs[0].transforms['1'], 1);
        equal(api.pack.outputs[0].transforms['2'], 2);
        equal(api.pack.outputs[0].transforms['3'], undefined);
        equal(api.pack.outputs[1].transforms['1'], 1);
        equal(api.pack.outputs[1].transforms['2'], undefined);
        equal(api.pack.outputs[1].transforms['3'], 3);
    });

    test("api.pack.to overrides existing transforms", function () {
        api.pack({ '1': 1 }).to({ target1: { '1': 2 } });
        equal(api.pack.outputs[0].transforms['1'], 2);
    });

    test("sync renames 'to' property to 'syncTo'", function() {
        equal(api.sync({ to: 'target' }).output.transforms.syncTo, 'target');
    });

    test("sync.to adds single target when passed a string", function () {
        api.sync('*.js').to('output');
        equal(api.pack.outputs.length, 1);
        equal(api.pack.outputs[0].transforms.syncTo, 'output');
    });

    test("sync.to adds an output for each target", function () {
        api.sync('*.*').to({ '1': {}, '2': {} });
        equal(api.pack.outputs.length, 2);
    });
})();
