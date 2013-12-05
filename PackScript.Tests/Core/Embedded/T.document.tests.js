QUnit.module('Embedded.T.document');

var source = loadSource();

test("extractDocumentation trims and concatenates", function () {
    var d = T.document.extractDocumentation("test\n   ////    { \n////           test: 'test\n////description'\ntest\n////}");
    equal(d, "{ test: 'test description' }");
});

test("findOrCreateNamespace finds existing namespace", function() {
    var target = { test1: { test2: { test3: {} } } };
    equal(T.document.findOrCreateNamespace(target, 'test1.test2'), target.test1.test2);
});

test("findOrCreateNamespace creates new namespace", function () {
    var target = { };
    equal(T.document.findOrCreateNamespace(target, 'test1.test2'), target.test1.test2);
});

test("captureMembers constructs namespace tree", function() {
    var documentation = T.document.extractDocumentation(source);
    var result = T.document.captureMembers(documentation);
    ok(result.Test);
    ok(result.Test.test1);
    ok(result.Test.test1.functions);
    equal(result.Test.test1.functions.length, 1);
    equal(result.Test.test1.functions[0].name, 'blah');
});

test("captureMembers logs error if documentation is invalid", function() {
    log = { error: sinon.spy() };
    T.document.captureMembers('invalid javascript');
    ok(log.error.calledOnce);
});

function loadSource() {
    //var result;
    //$.ajax({
    //    url: 'Core/Embedded/source.js',
    //    async: false,
    //    success: function(content) {
    //        result = content;
    //    }
    //});
    //return result;
    return '//// namespace(\'Test.test1\');\n//// func({ name: \'blah\', \n////     description: \'test\n////                   test\', arguments: [{}], returns: \'test\' });\nfunction blah() { }';
}