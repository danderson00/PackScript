QUnit.module('Embedded.T.scripts');

test("Specifying folder includes all js files", function() {
    var include = T.scripts('Scripts');
    equal(include.files, 'Scripts/*.js');
});

test("Specifying file includes single file", function () {
    var include = T.scripts('test.js');
    equal(include.files, 'test.js');
});

test("Specifying filespec includes filespec", function () {
    var include = T.scripts('Tests/*.tests.js');
    equal(include.files, 'Tests/*.tests.js');
});

test("T.Script template is used if debug is not specified", function () {
    var include = T.scripts('Scripts');
    var output = { transforms: {} };
    equal(include.template(output).name, 'T.Script');
});

test("T.Script.debug template is used if debug transform is specified", function () {
    var include = T.scripts('Scripts', true);
    var output = { transforms: { debug: true } };
    equal(include.template(output).name, 'T.Script.debug');
});

test("Path can be specified in object", function () {
    var include = T.scripts({ path: 'Scripts' });
    equal(include.files, 'Scripts/*.js');
});

test("Debug can be specified in object", function () {
    var include = T.scripts({ path: 'Scripts', debug: true });
    var output = { transforms: {} };
    equal(include.template(output).name, 'T.Script.debug');
});

QUnit.module('Embedded.T.panes');

test("T.panes includes relevant files from specified folder", function () {
    var includes = T.panes('Panes');
    equal(includes.length, 3);
    equal(includes[0].files, 'Panes/*.js');
    equal(includes[1].files, 'Panes/*.htm');
    equal(includes[2].files, 'Panes/*.css');
});

QUnit.module('Embedded.T.models');

test("T.models uses model and script templates", function () {
    var include = T.models('Panes');
    var template = include.template({ transforms: {} });
    equal(template.length, 2);
    equal(template[0].name, 'T.Model');
    equal(template[1].name, 'T.Script');
});