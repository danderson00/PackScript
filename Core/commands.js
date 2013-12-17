(function() {
    Pack.prototype.all = function() {
        this.build(this.outputs);
        return this;
    };

    Pack.prototype.build = function(outputs) {
        var self = this;

        if (!this.options.throttleTimeout)
            this.buildSync(outputs);
        else {
            // this should be separated and unit tested
            var timeout = this.options.throttleTimeout;
            this.buildQueue = _.union(this.buildQueue, outputs);

            if (this.buildQueue.length > 0) {
                if (this.buildTimeout)
                    clearTimeout(this.buildTimeout);

                this.buildTimeout = setTimeout(function() {
                    var queue = self.buildQueue;
                    self.buildQueue = [];
                    self.buildTimeout = undefined;
                    self.buildSync(queue);
                }, timeout);
            }
        }
        return this;
    };

    Pack.prototype.buildSync = function (outputs) {
        var self = this;

        Pack.utils.executeSingleOrArray(outputs, buildOutput);

        // if we are in watch mode, the file system watcher will handle recursion
        if (!this.options.watch) {
            // determine what files were written
            var outputPaths = _.isArray(outputs) ? _.pluck(outputs, 'outputPath') : outputs.outputPath;
            
            // build any outputs that match the written files
            var matchingOutputs = this.matchingOutputs(outputPaths);
            if (matchingOutputs.length > 0)
                this.build(matchingOutputs);
            return this;
        }

        function buildOutput(output) {
            return output.build(self.transforms);
        }
    };

    Pack.prototype.executeTransform = function(name, output) {
        if (this.transforms[name])
            return this.transforms[name].apply(output.transforms[name], output);
    };    
})();
