﻿(function () {
    QUnit.module("transforms.template");

    test("template renders underscore template", function () {
        var data = { files: new FileList({ path: 'filepath', content: 'filecontent' }) };
        pack.templates = { 'template': 'templatecontent' };
        Pack.transforms.template.apply(wrap('template', {}, data));

        equal(data.files.list.length, 1);
        equal(data.files.list[0].content, 'templatecontent');
    });

    test("template renders multiple underscore templates", function () {
        var data = { files: new FileList({ path: 'filepath', content: 'filecontent' }) };
        pack.templates = { 'template': 'templatecontent', 'template2': '<%=content%>2' };
        Pack.transforms.template.apply(wrap(['template', 'template2'], {}, data));

        equal(data.files.list.length, 1);
        equal(data.files.list[0].content, 'templatecontent2');
    });

    test("template renders built-in data", function () {
        var output = { basePath: '/test/' };
        var data = { files: new FileList({ path: '/test/files/file', content: 'content', filespec: '/files/*.*', configPath: '/test/', pathRelativeToConfig: 'files/file', includePath: '/test/files/', pathRelativeToInclude: 'file' }) };
        pack.templates = { 'template': '<%=path%>|<%=content%>|<%=configPath%>|<%=pathRelativeToConfig%>|<%=includePath%>|<%=pathRelativeToInclude%>' };
        Pack.transforms.template.apply(wrap('template', output, data));

        equal(data.files.list.length, 1);
        equal(data.files.list[0].content, '/test/files/file|content|/test/|files/file|/test/files/|file');
    });

    test("template name can be specified with an object", function () {
        var data = { files: new FileList({ path: 'filepath', content: 'filecontent' }) };
        pack.templates = { 'template': 'templatecontent' };
        Pack.transforms.template.apply(wrap({ name: 'template' }, {}, data));

        equal(data.files.list.length, 1);
        equal(data.files.list[0].content, 'templatecontent');
    });

    test("data specified in include transform overrides data in template transform", function() {
        var data = { files: new FileList({ path: 'filepath', content: 'filecontent', template: { name: 'template', data: { additionalData: 'add1' } } }) };
        pack.templates = { 'template': '<%=data.additionalData%>' };
        Pack.transforms.template.apply(wrap({ name: 'template', data: { additionalData: 'add2' } }, {}, data));

        equal(data.files.list.length, 1);
        equal(data.files.list[0].content, 'add1');
    });

    test("Path objects can be used in templates", function () {
        var data = { files: new FileList({ path: 'path/file.txt', content: 'filecontent' }) };
        pack.templates = { 'template': '<%=path.withoutFilename()%>' };
        Pack.transforms.template.apply(wrap('template', {}, data));

        equal(data.files.list.length, 1);
        equal(data.files.list[0].content, 'path/');
    });

    test("When function is passed as template value, actual value is set from function evaluation", function () {
        expect(4);
        var output = {};
        var data = { files: new FileList({ path: 'filepath', content: 'filecontent' }) };
        pack.templates = { 'template': 'templatecontent' };
        Pack.transforms.template.apply(wrap(function(currentOutput, target) {
            equal(currentOutput, output);
            equal(target, data);
            return 'template';
        }, output, data));

        equal(data.files.list.length, 1);
        equal(data.files.list[0].content, 'templatecontent');
    });
})();
