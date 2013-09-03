Pack.utils = {};

Pack.utils.eval = function (source) {
    try {
        (function () { eval.apply(this, arguments); }('(function(){' + source + '})();'));
    } catch (exception) {
        Pack.utils.logError(exception);
    }
};

Pack.utils.logError = function (error, message) {
    var customMessage = message ? message + '\n' : '';
    var errorMessage = error instanceof Error ? error.name + ': ' + error.message : error;
    Log.error(customMessage + errorMessage);
};

Pack.utils.executeSingleOrArray = function (value, func, reverse) {
    if (_.isArguments(value))
        value = _.toArray(value);
    
    if (_.isArray(value)) {
        var array = _.flatten(value);
        return _.map(reverse ? array.reverse() : array, function (individualValue) {
            // we can't shortcut this or may introduce unintended arguments from the _.map function
            return func(individualValue);
        });
    } else
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