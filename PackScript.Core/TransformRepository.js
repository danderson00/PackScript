Pack.TransformRepository = function () {
    var self = this;

    this.events = ['files', 'content', 'output', 'finalise'];
    this.defaultTransforms = { load: true, combine: true, template: true };
    
    this.add = function (name, event, func) {
        self[name] = { event: event, func: func };
    };

    this.applyTo = function(output) {
        var transforms = _.extend({}, self.defaultTransforms, output.transforms);
        _.each(self.events, function (event) {
            _.each(transforms, function (value, name) {
                if (self[name] && self[name].event === event)
                    self[name].func(value, output);
            });
        });
        return output;
    };
};