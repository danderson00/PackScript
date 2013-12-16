T.webTargets = function(path) {
    var targets = {};
    targets[path + '.js'] = {};
    targets[path + '.min.js'] = { minify: true };
    targets[path + '.debug.js'] = { debug: true };
    return targets;
};

T.webDependency = function(path) {
    return function(output) {
        if (output.transforms.minify)
            return path + '.min.js';
        if (output.transforms.debug)
            return path + '.debug.js';
        return path + '.js';
    };
};