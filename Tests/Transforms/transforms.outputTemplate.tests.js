(function () {
    QUnit.module("transforms.outputTemplate");

    test("outputTemplate renders underscore template", function () {
        var data = { output: '' };
        var pack = { templates: { 'template': 'templatecontent' } };
        Pack.transforms.outputTemplate.apply(wrap('template', { transforms: { to: 'test' } }, data), pack);

        equal(data.output, 'templatecontent');
    });

    test("outputTemplate renders multiple underscore templates", function () {
        var data = { output: '' };
        var pack = { templates: { 'template': 'templatecontent', 'template2': '<%=content%>2' } };
        Pack.transforms.outputTemplate.apply(wrap(['template', 'template2'], { transforms: { to: 'test' } }, data), pack);

        equal(data.output, '\ntemplatecontent2');
    });

    test("outputTemplate renders passed data", function () {
        var data = { output: 'content' };
        var pack = { templates: { 'template': '<%=content%><%=data.value%>' } };
        Pack.transforms.outputTemplate.apply(wrap({ name: 'template', data: { value: 'testValue' } }, { transforms: { to: 'test' } }, data), pack);

        equal(data.output, '\ncontenttestValue');
    });
})();
