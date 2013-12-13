function integrationTest(path, tests) {
    QUnit.module('Integration.' + path, {
        setup: function() {
            Pack.api.Files = {
                getFilenames: function(filespec, recursive) {
                    return originalApi.getFilenames(filespec, recursive);
                },
                getFileContents: function(files) {
                    return originalApi.getFileContents(files);
                },
                writeFile: sinon.spy(),
                copyFile: sinon.spy()
            };
            pack = new Pack.Api({ throttle: false }).pack;
            pack.scanForResources('Tests/Integration/' + path + '/').all();
        }
    });

    function outputAssertions(file) {
        return {
            equals: function(value) {
                equal(output(file), value, file);
            },
            contains: function(value) {
                ok(output(file).indexOf(value) !== -1, file + ' contains "' + value + '"');
            },
            containsOnce: function(value) {
                var fileOutput = output(file);
                var firstIndex = fileOutput.indexOf(value);
                ok(firstIndex !== -1 && fileOutput.indexOf(value, firstIndex + value.length) === -1,
                    "The string '" + fileOutput + "' contains the value '" + value + "' only once.");
            }
        };
    }

    test(path, function() {
        tests(outputAssertions);
    });

    function output(file) {
        var Files = Pack.api.Files;
        for (var i = 0, l = Files.writeFile.callCount; i < l; i++) {
            var call = Files.writeFile.getCall(i);
            var path = call.args[0];
            if (path.indexOf('/' + file, path.length - file.length - 1) !== -1)
                return call.args[1];
        }
    }
}

