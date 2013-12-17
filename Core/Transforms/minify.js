Pack.transforms.minify = {
    event: 'output',
    apply: function(data, pack) {
        var output = data.output;
        var target = data.target;
        var Log = Pack.api.Log;
        var api = Pack.api;

        if (data.value) {
            Log.debug('Minifying ' + output.transforms.to);
            switch (Path(output.transforms.to).extension().toString()) {
            case 'js':
                minify(api.MinifyJavascript);
                break;
            case 'htm':
            case 'html':
                minify(api.MinifyMarkup);
                break;
            case 'css':
                minify(api.MinifyStylesheet);
                break;
            default:
                Log.warn('Minification requested but not supported for ' + output.transforms.to);
            }
        }

        function minify(api) {
            if (api)
                target.output = api.minify(target.output);
            else
                Log.warn("Minification was requested but no appropriate API was provided for " + output.transforms.to);
        }
    }
};
