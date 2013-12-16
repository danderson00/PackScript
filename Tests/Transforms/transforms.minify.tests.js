(function () {
    QUnit.module("transforms.minify", { setup: minifierAsSpy });
    
    test("minify calls appropriate API functions", function () {        
        Pack.transforms.minify.apply(wrap(true, { transforms: { to: 'test.js' } }, { output: 'js' }));
        Pack.transforms.minify.apply(wrap(true, { transforms: { to: 'test.htm' } }, { output: 'htm' }));
        Pack.transforms.minify.apply(wrap(true, { transforms: { to: 'test.css' } }, { output: 'css' }));

        ok(Pack.api.MinifyJavascript.minify.calledWithExactly('js'));
        ok(Pack.api.MinifyMarkup.minify.calledWithExactly('htm'));
        ok(Pack.api.MinifyStylesheet.minify.calledWithExactly('css'));
    });
})();
