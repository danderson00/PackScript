(function () {
    pack.transforms.add('minify', 'output', function (value, output) {
        Log.debug('Minifying ' + output.transforms.to);
        switch (Path(output.transforms.to).extension().toString()) {
            case 'js':
                minify(typeof MinifyJavascript !== 'undefined' ? MinifyJavascript : null, output);
                break;
            case 'htm':
            case 'html':
                minify(typeof MinifyMarkup !== 'undefined' ? MinifyMarkup : null, output);
                break;
            case 'css':
                minify(typeof MinifyStylesheet !== 'undefined' ? MinifyStylesheet : null, output);
                break;
            default:
                Log.warn('Minification requested but not supported for ' + output.transforms.to);
        }
    });
    
    function minify(api, output) {
        if (api)
            output.output = api.minify(output.output);
        else
            Log.warn("Minification was requested but no appropriate API was provided for " + output.transforms.to);
    }
})();

