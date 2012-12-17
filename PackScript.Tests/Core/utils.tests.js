(function () {
    module("utils");

    test("executeSingleOrArray returns array if passed array", function () {
        var result = Pack.utils.executeSingleOrArray([1, 2], function (value) { return value * 2; });
        equal(result.length, 2);
        equal(result[0], 2);
        equal(result[1], 4);
    });
})();
