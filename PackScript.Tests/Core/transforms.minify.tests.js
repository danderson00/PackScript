(function () {
    module("transforms.minify", { setup: minifierAsSpy });
    
    test("minify calls appropriate API functions", function () {        
        pack.transforms.minify.func(true, { output: 'js', transforms: { to: 'test.js' } });
        pack.transforms.minify.func(true, { output: 'htm', transforms: { to: 'test.htm' } });
        pack.transforms.minify.func(true, { output: 'css', transforms: { to: 'test.css' } });

        ok(MinifyJavascript.minify.calledWithExactly('js'));
        ok(MinifyMarkup.minify.calledWithExactly('htm'));
        ok(MinifyStylesheet.minify.calledWithExactly('css'));
    });
})();
