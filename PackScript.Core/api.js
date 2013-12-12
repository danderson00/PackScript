Pack.Api = function (packOptions) {
    var self = this;
    
    this.pack = function (options) {
        options = unwrapOptions(options, arguments);
        return addOutputs(options, 'to');
    };

    this.sync = function(options) {
        options = unwrapOptions(options, arguments);
        renameProperties(options, 'to', 'syncTo');
        return addOutputs(options, 'syncTo');
    };

    this.zip = function(options) {
        options = unwrapOptions(options, arguments);
        renameProperties(options, 'to', 'zipTo');
        return addOutputs(options, 'zipTo');
    };

    function addOutputs(options, transformName) {
        var outputs = self.pack.addOutput(options, Context.configPath);

        if (outputs.length === 1)
            return createWrapper(outputs[0]);

        return _.map(outputs, createWrapper);

        function createWrapper(output) {
            return {
                output: output,
                to: function (targets) {
                    self.pack.removeOutput(output);
                    _.each(unwrapTargets(targets), addMergedTransforms);
                }
            };
            
            function unwrapTargets(targets) {
                if (targets.constructor === String) {
                    var unwrapped = {};
                    unwrapped[targets] = {};
                    return unwrapped;
                }
                return targets;
            }

            function addMergedTransforms(targetTransforms, path) {
                var transforms = _.extend({}, output.transforms, targetTransforms);
                transforms[transformName] = path;
                self.pack.addOutput(transforms, output.configPath);
            }            
        }
    }
    
    function unwrapOptions(options, args) {
        // If we're passed a string or an array, assume we want this to be the include option
        if (options.constructor === String || _.isArray(options))
            return [{ include: options }];
        return _.toArray(args);
    }
    
    function renameProperties(array, from, to) {
        _.each(array, function(target) {
            target[to] = target[from];
            delete target[from];
        });
    }

    // extend the pack member of the api object with a new instance of a Pack object
    _.extend(self.pack, new Pack(packOptions));
};
