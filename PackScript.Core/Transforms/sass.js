Pack.transforms.sass = {
    event: 'output',
    apply: function(data) {
        var target = data.target;
        var output = data.output;
        var Log = Pack.api.Log;

        if (typeof Sass === 'undefined') {
            Log.warn("SASS compilation requested but no API provided");
            return;
        }

        Log.debug('Applying SASS compiler to ' + (output.transforms && output.transforms.to));
        var compiled = Sass.apply(target.output);
        if (compiled)
            target.output = compiled;
    }
};

