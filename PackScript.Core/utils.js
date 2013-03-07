Pack.utils = {};

Pack.utils.eval = function (source) {
    (function () { eval.apply(this, arguments); }('(function(){' + source + '})();'));
};

Pack.utils.logError = function (error) {
    Log.error(error instanceof Error ? error.name + ': ' + error.message : error);
};

Pack.utils.executeSingleOrArray = function (value, func, reverse) {
    if (_.isArray(value))
        return _.map(reverse ? value.reverse() : value, function(individualValue) {
            // we can't shortcut this or may introduce unintended arguments from the _.map function
            return func(individualValue);
        });
    else
        return func(value);
};

Pack.utils.invokeSingleOrArray = function (value, method) {
    return Pack.utils.executeSingleOrArray(value, function(target) {
        return target[method]();
    });
};

Pack.prototype.outputsFor = function(path) {
    return _.filter(this.outputs, function(output) {
        return output.transforms.to && Path(output.transforms.to).match(path);
    });
};