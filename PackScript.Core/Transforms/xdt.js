Pack.transforms.xdt = {
    event: 'output',
    apply: function(data) {
        var target = data.target;
        var output = data.output;
        var Log = Pack.api.Log;

        if (typeof Xdt === 'undefined') {
            Log.error("XDT transform requested but no API provided");
            return;
        }

        Log.debug('Applying XDT transforms to ' + (output.transforms && output.transforms.to));

        _.each(data.value, function(template) {
            target.output = Xdt.transform(target.output, pack.templates[template]);
        });
    }
};

