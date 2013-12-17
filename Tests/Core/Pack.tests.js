(function () {
    var pack;

    QUnit.module('Pack', {
        setup: function () { pack = new Pack(); }
    });

    test("addOutput accepts single objects", function () {
        pack.addOutput({});
        equal(pack.outputs.length, 1);
    });

    test("addOutput accepts arrays", function () {
        pack.addOutput([{}, {}]);
        equal(pack.outputs.length, 2);
    });

    test("addOutput accepts nested arrays", function () {
        pack.addOutput([{}, [{}, {}]]);
        equal(pack.outputs.length, 3);
    });
})();
