(function () {
    Pack.transforms.add('minify', 'output', function (data) {
        var output = data.output;
        var target = data.target;
        
        if (data.value) {
            Log.debug('Minifying ' + output.transforms.to);
            switch (Path(output.transforms.to).extension().toString()) {
            case 'js':
                minify(typeof MinifyJavascript !== 'undefined' ? MinifyJavascript : null, output, target);
                break;
            case 'htm':
            case 'html':
                minify(typeof MinifyMarkup !== 'undefined' ? MinifyMarkup : null, output, target);
                break;
            case 'css':
                minify(typeof MinifyStylesheet !== 'undefined' ? MinifyStylesheet : null, output, target);
                break;
            default:
                Log.warn('Minification requested but not supported for ' + output.transforms.to);
            }
        }
    });
    
    function minify(api, output, target) {
        if (api)
            target.output = api.minify(target.output);
        else
            Log.warn("Minification was requested but no appropriate API was provided for " + output.transforms.to);
    }
})();

