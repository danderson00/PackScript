T.scripts = function (pathOrOptions, debug) {
    var options = normaliseOptions(pathOrOptions, debug);
    return include(function(output) {
        return {
            name: (options.debug || output.transforms.debug) ? 'T.Script.debug' : 'T.Script',
            data: options
        };
    }, 'js', options);
};

T.resources = T.models = T.sagas = function(pathOrOptions, debug) {
    var options = normaliseOptions(pathOrOptions, debug);
    var template = function(output) {
        return [
            { name: 'T.Resource', data: options },
            { name: (options.debug || output.transforms.debug) ? 'T.Script.debug' : 'T.Script', data: options }
        ];
    };
    return include(template, 'js', options);
};

T.templates = function(pathOrOptions, debug) {
    var options = normaliseOptions(pathOrOptions, debug);
    return include('T.Template', 'htm', options);
};

T.styles = function(pathOrOptions, debug) {
    var options = normaliseOptions(pathOrOptions, debug);
    return include('T.Style', 'css', options);
};

T.panes = function (pathOrOptions, debug) {
    return [
        T.models(pathOrOptions, debug),
        T.templates(pathOrOptions, debug),
        T.styles(pathOrOptions, debug)
    ];
};

function include(template, extension, data) {
    if (template.constructor === String)
        template = { name: template, data: data };

    var path = data.path;
    if (Path(data.path).extension().toString() !== extension)
        path += '/*.' + extension;
    
    return {
        files: path,
        recursive: data.recursive !== false,
        template: template
    };
}

function normaliseOptions(pathOrOptions, debug) {
    if (pathOrOptions.constructor === String)
        pathOrOptions = { path: pathOrOptions };
    if (debug === true)
        pathOrOptions.debug = true;
    return pathOrOptions;
}