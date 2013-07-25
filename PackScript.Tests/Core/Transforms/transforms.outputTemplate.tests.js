(function () {
    module("transforms.outputTemplate");

    test("outputTemplate renders underscore template", function () {
        var data = { output: '' };
        pack.templates = { 'template': 'templatecontent' };
        pack.transforms.outputTemplate.apply(wrap('template', { transforms: { to: 'test' } }, data));

        equal(data.output, 'templatecontent');
    });

    test("outputTemplate renders multiple underscore templates", function () {
        var data = { output: '' };
        pack.templates = { 'template': 'templatecontent', 'template2': '<%=content%>2' };
        pack.transforms.outputTemplate.apply(wrap(['template', 'template2'], { transforms: { to: 'test' } }, data));

        equal(data.output, 'templatecontent2');
    });

    test("outputTemplate renders passed data", function () {
        var data = { output: 'content' };
        pack.templates = { 'template': '<%=content%><%=data.value%>' };
        pack.transforms.outputTemplate.apply(wrap({ name: 'template', data: { value: 'testValue' } }, { transforms: { to: 'test' } }, data));

        equal(data.output, 'contenttestValue');
    });
})();
