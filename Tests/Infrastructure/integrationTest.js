function integrationTest(path, name, tests) {
    if (arguments[1].constructor === Function) {
        tests = arguments[1];
        name = path;
    }

    var api = new Pack.Api({ throttleTimeout: 0, excludedDirectories: 'excluded' });

    QUnit.module('Integration.' + path, {
        setup: function () {
            minifierAsOriginal();
            Pack.api.Files = {
                getFilenames: function(filespec, recursive) {
                    return originalFiles.getFilenames(filespec, recursive);
                },
                getFileContents: function(files) {
                    return originalFiles.getFileContents(files);
                },
                writeFile: sinon.spy(),
                copyFile: sinon.spy(),
                excludedDirectories: 'excluded'
            };
            sinon.spy(Pack.api.Files, 'getFilenames');
            sinon.spy(Pack.api.Files, 'getFileContents');

            sync = api.sync;
            pack = api.pack;
            zip = api.zip;
            pack.scanForResources('Tests/Integration/' + path + '/').all();
        }
    });

    test(name, function() {
        tests(outputAssertions, api);
    });

    function outputAssertions(file) {
        return {
            equals: function (value) {
                equal(output(file), value, file);
            },
            contains: function (value, message) {
                var fileOutput = output(file);
                ok(fileOutput.indexOf(value) !== -1, fileOutput + ' contains "' + value + '" (' + message + ')');
            },
            containsOnce: function (value) {
                var fileOutput = output(file);
                var firstIndex = fileOutput.indexOf(value);
                ok(firstIndex !== -1 && fileOutput.indexOf(value, firstIndex + value.length) === -1,
                    "The string '" + fileOutput + "' contains the value '" + value + "' only once.");
            }
        };
    }

    outputAssertions.zip = function (file) {
        return readZip(file).files;
    };

    function output(file) {
        var Files = Pack.api.Files;
        for (var i = 0, l = Files.writeFile.callCount; i < l; i++) {
            var call = Files.writeFile.getCall(i);
            var path = call.args[0];
            if (path.indexOf('/' + file, path.length - file.length - 1) !== -1)
                return call.args[1];
        }
    }
    
    function readZip(file) {
        var data = require('fs').readFileSync('Tests/Integration/TestOutput/' + file, 'binary');
        return new require('node-zip')(data, { base64: false, checkCRC32: true });
        
    }
}

