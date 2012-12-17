(function () {
    module("transforms.template");

    test("template renders underscore template", function () {
        var data = { files: new FileList({ path: 'filepath', content: 'filecontent' }) };
        pack.templates = { 'template': 'templatecontent' };
        pack.transforms.template.func('template', data);

        equal(data.files.list.length, 1);
        equal(data.files.list[0].content, 'templatecontent');
    });

    test("template renders built-in data", function () {
        var data = { files: new FileList({ path: '/test/files/file', content: 'content' }), path: '/test/' };
        pack.templates = { 'template': '<%=path%><%=content%><%=configPath%><%=pathRelativeToConfig%>' };
        pack.transforms.template.func('template', data);

        equal(data.files.list.length, 1);
        equal(data.files.list[0].content, '/test/files/file' + 'content' + '/test/' + 'files/file');
    });

    test("template name can be specified with an object", function () {
        var data = { files: new FileList({ path: 'filepath', content: 'filecontent' }) };
        pack.templates = { 'template': 'templatecontent' };
        pack.transforms.template.func({ name: 'template' }, data);

        equal(data.files.list.length, 1);
        equal(data.files.list[0].content, 'templatecontent');
    });

    test("additional data can be passed to template", function() {
        var data = { files: new FileList({ path: 'filepath', content: 'filecontent' }) };
        pack.templates = { 'template': '<%=additionalData%>' };
        pack.transforms.template.func({ name: 'template', data: { additionalData: 'add' } }, data);

        equal(data.files.list.length, 1);
        equal(data.files.list[0].content, 'add');
    });
})();
