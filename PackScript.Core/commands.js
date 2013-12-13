(function() {
    Pack.prototype.all = function() {
        this.build(this.outputs);
        return this;
    };

    Pack.prototype.build = function (outputs) {
        var self = this;

        if (!this.options.throttle)
            this.buildSync(outputs);
        else {
            var timeout = this.options.throttleTimeout;
            this.buildQueue = _.union(this.buildQueue, outputs);

            if (this.buildTimeout)
                clearTimeout(this.buildTimeout);
            
            this.buildTimeout = setTimeout(function() {
                self.buildSync(this.buildQueue);
                this.buildQueue = [];
                this.buildTimeout = undefined;
            }, timeout);
        }
        return this;
    };

    Pack.prototype.buildSync = function (outputs) {
        var self = this;

        Pack.utils.executeSingleOrArray(outputs, buildOutput);

        var outputPaths = _.isArray(outputs) ? _.pluck(outputs, 'outputPath') : outputs.outputPath;
        var matchingOutputs = this.matchingOutputs(outputPaths);
        if (matchingOutputs.length > 0)
            this.build(matchingOutputs);
        return this;

        function buildOutput(output) {
            return output.build(self.transforms);
        }
    };

    Pack.prototype.executeTransform = function(name, output) {
        if (this.transforms[name])
            return this.transforms[name].apply(output.transforms[name], output);
    };    
})();
