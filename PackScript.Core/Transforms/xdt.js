(function () {
    Pack.transforms.add('xdt', 'output', function (data) {
        var target = data.target;
        var output = data.output;

        if (typeof Xdt === 'undefined') {
            Log.error("XDT transform requested but no API provided");
            return;
        }

        Log.debug('Applying XDT transforms to ' + (output.transforms && output.transforms.to));

        _.each(data.value, function(template) {
            target.output = Xdt.transform(target.output, pack.templates[template]);
        });
    });
})();

