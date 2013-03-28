(function () {
    module("transforms.outputTemplate");

    test("template renders underscore template", function () {
        var data = { output: '' };
        pack.templates = { 'template': 'templatecontent' };
        pack.transforms.outputTemplate.apply(wrap('template', { transforms: { to: 'test' } }, data));

        equal(data.output, 'templatecontent');
    });

    test("template renders passed data", function () {
        var data = { output: 'content' };
        pack.templates = { 'template': '<%=content%><%=value%>' };
        pack.transforms.outputTemplate.apply(wrap({ name: 'template', data: { value: 'testValue' } }, { transforms: { to: 'test' } }, data));

        equal(data.output, 'contenttestValue');
    });
})();
