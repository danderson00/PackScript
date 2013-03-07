(function () {
    pack.transforms.add('sass', 'output', function (data) {
        var target = data.target;
        var output = data.output;

        if (typeof Sass === 'undefined') {
            Log.warn("SASS compilation requested but no API provided");
            return;
        }

        Log.debug('Applying SASS compiler to ' + (output.transforms && output.transforms.to));
        var compiled = Sass.apply(target.output);
        if (compiled)
            target.output = compiled;
    });
})();

