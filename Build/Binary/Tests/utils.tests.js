(function () {
    QUnit.module("utils");

    test("executeSingleOrArray returns array if passed array", function () {
        var result = Pack.utils.executeSingleOrArray([1, 2], function (value) { return value * 2; });
        equal(result.length, 2);
        equal(result[0], 2);
        equal(result[1], 4);
    });

    test("executeSingleOrArray handles arguments object", function () {
        (function() {
            var result = Pack.utils.executeSingleOrArray(arguments, function() { });
            equal(result.length, 3);
        })(1, 2, 3);
    });

    test("executeSingleOrArray flattens arrays if requested", function () {
        var result = Pack.utils.executeSingleOrArray([1, [2, 3]], function () { }, true);
        equal(result.length, 3);
    });
})();
