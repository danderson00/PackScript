(function () {
    module("transforms.minify", { setup: minifierAsSpy });
    
    test("minify calls appropriate API functions", function () {        
        pack.transforms.minify.apply(wrap(true, { transforms: { to: 'test.js' } }, { output: 'js' }));
        pack.transforms.minify.apply(wrap(true, { transforms: { to: 'test.htm' } }, { output: 'htm' }));
        pack.transforms.minify.apply(wrap(true, { transforms: { to: 'test.css' } }, { output: 'css' }));

        ok(MinifyJavascript.minify.calledWithExactly('js'));
        ok(MinifyMarkup.minify.calledWithExactly('htm'));
        ok(MinifyStylesheet.minify.calledWithExactly('css'));
    });
})();
