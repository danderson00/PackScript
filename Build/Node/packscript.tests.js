
require('./packscript.js');
var sinon = require('sinon');
var _ = require('underscore');
//_.extend(global, new Pack.Api({ throttleTimeout: 0 }));
var originalFiles = Pack.api.Files;

var originalMinifyJavascript = Pack.api.MinifyJavascript;
var originalMinifyStylesheet = Pack.api.MinifyStylesheet;
var originalMinifyMarkup = Pack.api.MinifyMarkup;

Context = {};

function filesAsMock() {
    Pack.api.Files = {
        getFilenames: function(path, filter, recursive) {
            return _.keys(Pack.api.Files.files);
        },
        getFileContents: function(files) {
            var result = {};
            for (var i = 0; i < files.length; i++)
                result[files[i]] = Pack.api.Files.files[files[i]];
            return result;
        },
        writeFile: function(path, content) {
            Pack.api.Files.files[path] = content;
        },
        files: {}
    };
}

function filesAsSpy() {
    Pack.api.Files = {
        getFilenames: sinon.spy(),
        getFileContents: sinon.spy(),
        writeFile: sinon.spy(),
        copy: sinon.spy()
    };
}

function filesAsOriginal() {
    Pack.api.Files = originalFiles;
}

function minifierAsOriginal() {
    Pack.api.MinifyJavascript = originalMinifyJavascript;
    Pack.api.MinifyStylesheet = originalMinifyStylesheet;
    Pack.api.MinifyMarkup = originalMinifyMarkup;
}

function minifierAsSpy() {
    Pack.api.MinifyJavascript = { minify: sinon.spy() };
    Pack.api.MinifyMarkup = { minify: sinon.spy() };
    Pack.api.MinifyStylesheet = { minify: sinon.spy() };
}
function wrap(value, output, target, options) {
    return {
        value: value,
        output: output,
        target: target || new Pack.Container(),
        options: options || {}
    };
}
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
                copy: sinon.spy(),
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


(function () {
    var api;
    
    QUnit.module('Api', {
        setup: function () { api = new Pack.Api(); }
    });

    test("pack converts strings to include transform", function () {
        api.pack('*.js');
        equal(api.pack.outputs.length, 1);
        equal(api.pack.outputs[0].transforms.include, '*.js');
    });

    test("pack converts arrays to include transform", function () {
        var files = ['*.js', '*.txt'];
        api.pack(files);
        equal(api.pack.outputs.length, 1);
        equal(api.pack.outputs[0].transforms.include, files);
    });

    test("pack returns wrapper object when passed a string", function() {
        var wrapper = api.pack('*.*');
        ok(wrapper.to);
        equal(wrapper.output.transforms.include, '*.*');
    });

    test("pack returns wrapper object when passed an object", function() {
        var wrapper = api.pack({ to: 'target' });
        ok(wrapper.to);
        equal(wrapper.output.transforms.to, 'target');
    });

    test("pack returns array of wrapper objects when passed multiple arguments", function () {
        var wrappers = api.pack({}, {});
        equal(wrappers.length, 2);
        ok(wrappers[0].to);
        ok(wrappers[1].to);
    });

    test("pack.to adds single target when passed a string", function() {
        api.pack('*.js').to('output.js');
        equal(api.pack.outputs.length, 1);
        equal(api.pack.outputs[0].transforms.to, 'output.js');
    });

    test("pack.to adds an output for each target", function () {
        api.pack({}).to({ '1': {}, '2': {} });
        equal(api.pack.outputs.length, 2);
    });

    test("pack.to sets 'to' transform from object key", function () {
        api.pack({}).to({ '1': {} });
        equal(api.pack.outputs[0].transforms.to, '1');
    });

    test("pack.to merges transforms from each target", function () {
        api.pack({ '1': 1 }).to({ target1: { '2': 2 }, target2: { '3': 3 } });
        equal(api.pack.outputs[0].transforms['1'], 1);
        equal(api.pack.outputs[0].transforms['2'], 2);
        equal(api.pack.outputs[0].transforms['3'], undefined);
        equal(api.pack.outputs[1].transforms['1'], 1);
        equal(api.pack.outputs[1].transforms['2'], undefined);
        equal(api.pack.outputs[1].transforms['3'], 3);
    });

    test("api.pack.to overrides existing transforms", function () {
        api.pack({ '1': 1 }).to({ target1: { '1': 2 } });
        equal(api.pack.outputs[0].transforms['1'], 2);
    });

    test("sync renames 'to' property to 'syncTo'", function() {
        equal(api.sync({ to: 'target' }).output.transforms.syncTo, 'target');
    });

    test("sync.to adds single target when passed a string", function () {
        api.sync('*.js').to('output');
        equal(api.pack.outputs.length, 1);
        equal(api.pack.outputs[0].transforms.syncTo, 'output');
    });

    test("sync.to adds an output for each target", function () {
        api.sync('*.*').to({ '1': {}, '2': {} });
        equal(api.pack.outputs.length, 2);
    });
})();

(function () {
    var p;
    
    QUnit.module("commands", { setup: setup });

    test("build writes full output", function () {
        Pack.api.Files.files = {
            'test.js': 'var test = "test";'
        };
        Pack.api.Files.writeFile = sinon.spy();
        var output = new Pack.Output({ to: "output.js", include: "test.js" }, "path/");
        p.build(output);
        ok(Pack.api.Files.writeFile.calledOnce);
        equal(Pack.api.Files.writeFile.firstCall.args[1], 'var test = "test";');
        //equal(output.output, 'var test = "test";');
    });

    test("build recurses when output path matches other outputs", function () {
        Pack.api.Files.getFilenames = getFilenames;
        Pack.api.Files.getFileContents = getFileContents;
        p.addOutput({ include: 'parent', to: 'child' }, '');
        p.addOutput({ include: 'child', to: 'output' }, '');
        var spy = sinon.spy();
        p.transforms.applyTo = spy;

        p.all();
        equal(spy.callCount, 3);

        function getFilenames(name) {
            return name === 'parent' ? ['parent'] : ['child'];
        }

        function getFileContents(files) {
            return files[0] === 'parent' ? { 'parent': 'parent' } : { 'child': 'child' };
        }
    });

    test("fileChanged updates config when called with config path", function() {
        Pack.api.Files.files['/test/test.pack.js'] = 'Test= "test"';
        p.scanForConfigs('/');
        equal(Test, 'test');
        Pack.api.Files.files['/test/test.pack.js'] = 'Test = "test2"';
        p.fileChanged('/test/test.pack.js');
        equal(Test, 'test2');
    });

    function setup() {
        p = new Pack({ throttleTimeout: 0 });
        filesAsMock(p);
    }
})();

(function () {
    QUnit.module("FileList");

    test("include adds single string", function () {
        var files = new Pack.FileList()
            .include('test');
        equal(files.list.length, 1);
        equal(files.list[0].path, 'test');
    });

    test("include adds single object", function () {
        var files = new Pack.FileList().include({ path: 'test' });
        equal(files.list.length, 1);
        equal(files.list[0].path, 'test');
    });

    test("include maps array of strings", function () {
        var files = new Pack.FileList().include(['test', 'test2']);
        equal(files.list.length, 2);
        equal(files.list[0].path, 'test');
        equal(files.list[1].path, 'test2');
    });

    test("include maps array of objects", function () {
        var files = new Pack.FileList().include([{ path: 'test', template: '' }, { path: 'test2', template: '' }]);
        equal(files.list.length, 2);
        equal(files.list[0].path, 'test');
        equal(files.list[1].path, 'test2');
    });

    test("exclude removes string from existing list", function() {
        var files = new Pack.FileList()
            .include(['test', 'test2'])
            .exclude('test');
        equal(files.list.length, 1);
        equal(files.list[0].path, 'test2');
    });

    test("exclude removes object from existing list", function () {
        var files = new Pack.FileList()
            .include(['test', 'test2'])
            .exclude({ path: 'test' });
        equal(files.list.length, 1);
        equal(files.list[0].path, 'test2');
    });

    test('filter removes objects from existing list by evaluating function', function() {
        var files = new Pack.FileList()
            .include(['1.js', '2.txt', '3.txt'])
            .filter(ifJavascript);
        equal(files.list.length, 1);
        equal(files.list[0].path, '1.js');
    });
    
    function ifJavascript(path) {
        return path.indexOf('.js', path.length - 3) !== -1;
    }

    test("list is initialised with constructor parameters", function() {
        var files = new Pack.FileList('test', 'test2');
        equal(files.list.length, 2);
        equal(files.list[0].path, 'test');
        equal(files.list[1].path, 'test2');
    });

    test("isEmpty returns true when list contains no files", function() {
        var files = new Pack.FileList()
            .include(['test'])
            .exclude({ path: 'test' });
        ok(files.isEmpty());
    });

    test("prioritise moves file with matching filename to the top of the list", function() {
        var files = new Pack.FileList()
            .include(['Path/1.js', 'Path/2.js', 'Path/3.js'])
            .prioritise('2.js');
        equal(files.list[0].path, 'Path/2.js');
    });
    
    test("when last parameter set, prioritise moves file with matching filename to the bottom of the list", function () {
        var files = new Pack.FileList()
            .include(['Path/1.js', 'Path/2.js', 'Path/3.js'])
            .prioritise('2.js', true);
        equal(files.list[2].path, 'Path/2.js');
    });
})();

(function () {
    QUnit.module("Output", { setup: filesAsMock });

    test("matches returns true if file list contains file", function() {
        var output = new Pack.Output({ include: '*.*' }, '');
        Pack.api.Files.files = ['1', '1', '2', '3'];
        ok(output.matches('2', new Pack.TransformRepository(Pack.transforms)));
    });

    test("matchingOutputs returns array of outputs matching file", function() {
        var p = new Pack();
        createOutput('1', true);
        createOutput('2', true);
        createOutput('3', false);
        equal(p.matchingOutputs().length, 2);

        function createOutput(name, matches) {
            var output = p.addOutput({ to: name }, '');
            output.matches = function() {
                return matches;
            };
        }
    });

    test("removeConfigOutputs removes outputs with matching config file", function() {
        var p = new Pack();
        p.outputs = [{ configPath: 'config' }, { configPath: 'config' }, { configPath: 'config2' }];
        p.removeConfigOutputs('config');
        equal(p.outputs.length, 1);
    });

    test("configOutputs returns all outputs with specified configPath", function() {
        var p = new Pack();
        p.outputs = [{ configPath: 'config' }, { configPath: 'config' }, { configPath: 'config2' }];
        var outputs = p.configOutputs('config');
        equal(outputs.length, 2);
    });

    test("executeTransform executes the appropriate transform", function () {
        expect(1);
        var p = new Pack();
        var output = new Pack.Output({ test: 'value' }, '');
        p.transforms.add('test', '', function(value) {
            equal(value, 'value');
        });
        p.executeTransform('test', output);
    });
})();

(function () {
    var pack;

    QUnit.module('Pack', {
        setup: function () { pack = new Pack(); }
    });

    test("addOutput accepts single objects", function () {
        pack.addOutput({});
        equal(pack.outputs.length, 1);
    });

    test("addOutput accepts arrays", function () {
        pack.addOutput([{}, {}]);
        equal(pack.outputs.length, 2);
    });

    test("addOutput accepts nested arrays", function () {
        pack.addOutput([{}, [{}, {}]]);
        equal(pack.outputs.length, 3);
    });
})();

(function () {
    QUnit.module("Path");

    test('Path handles empty arguments', function() {
        equal(Path('').toString(), '');
        equal(Path(undefined).toString(), '');
        equal(Path(null).toString(), '');
    });

    test("withoutFilename", function () {
        equal(Path("/folder/subfolder/filename.ext").withoutFilename().toString(), "/folder/subfolder/", "Path with slashes");
        equal(Path("\\folder\\subfolder\\filename.ext").withoutFilename().toString(), "/folder/subfolder/", "Path with backslashes");
    });

    test("filename", function () {
        equal(Path("filename.ext").filename().toString(), "filename.ext", "Filename");
        equal(Path("/filename.ext").filename().toString(), "filename.ext", "Root path filename");
        equal(Path("/folder/subfolder/filename.ext").filename().toString(), "filename.ext", "Path with slashes");
        equal(Path("\\folder\\subfolder\\filename.ext").filename().toString(), "filename.ext", "Path with backslashes");
    });

    test("extension", function () {
        equal(Path("filename.ext").extension().toString(), "ext", "Filename");
        equal(Path("/filename.ext").extension().toString(), "ext", "Root path filename");
        equal(Path("filename").extension().toString(), "", "Filename without extension");
        equal(Path("/filename").extension().toString(), "", "Root path filename without extension");
        equal(Path("filename.").extension().toString(), "", "Empty extension");
        equal(Path("/folder/subfolder/filename.ext").extension().toString(), "ext", "Path with slashes");
        equal(Path("\\folder\\subfolder\\filename.ext").extension().toString(), "ext", "Path with backslashes");
    });

    test("withoutExtension", function () {
        equal(Path("filename.ext").withoutExtension().toString(), "filename");
        equal(Path("filename").withoutExtension().toString(), "filename");
        equal(Path("/test/filename.ext").withoutExtension().toString(), "/test/filename");
        equal(Path("/test/filename").withoutExtension().toString(), "/test/filename");
        equal(Path("/test/filename.ext").filename().withoutExtension().toString(), "filename");
        equal(Path("/test/filename").filename().withoutExtension().toString(), "filename");
    });

    test("Path objects can be concatenated with strings", function() {
        equal(Path('/folder/filename.ext').withoutFilename() + 'new.ext', '/folder/new.ext');
    });

    test("isAbsolute", function() {
        ok(Path("/test/").isAbsolute());
        ok(Path("\\test\\").isAbsolute());
        ok(Path("C:\\test\\").isAbsolute());
        ok(!Path("test\\").isAbsolute());
    });
    
    test("makeAbsolute", function () {
        equal(Path("/test").makeAbsolute().toString(), "/test");
        equal(Path("test").makeAbsolute().toString(), "/test");
        equal(Path("test.txt").makeAbsolute().toString(), "/test.txt");
        equal(Path("test/test.txt").makeAbsolute().toString(), "/test/test.txt");
    });

    test("makeRelative", function () {
        equal(Path("test").makeRelative().toString(), "test");
        equal(Path("/test").makeRelative().toString(), "test");
        equal(Path("/test.txt").makeRelative().toString(), "test.txt");
        equal(Path("/test/test.txt").makeRelative().toString(), "test/test.txt");
        equal(Path("\\test\\test.txt").makeRelative().toString(), "test/test.txt");
    });

    test("match", function () {
        equal(Path("test.js").match("test.js"), "test.js");
        equal(Path("test\\test.js").match("test.js"), "test.js");
        equal(Path("test.js").match("*.js"), "test.js");
        //ok(!Path("atest.js").match("test.js"));
        ok(!Path("test.jsa").match("test.js"));
        ok(!Path("test.jsa").match("*.js"));

        equal(Path("c:\\test\\test.js").match("test.js"), "test.js");
        equal(Path("c:\\test\\test.js").match("*.js"), "test.js");
        equal(Path("c:\\test\\test.js").match("test\\test.js"), "test/test.js");
        equal(Path("c:\\test\\test.js").match("test\\*.js"), "test/test.js");
        equal(Path("c:\\test\\test.js").match("test/test.js"), "test/test.js");
        equal(Path("c:\\test\\test.js").match("test/*.js"), "test/test.js");

        equal(Path("c:\\test\\pack.js").match("*pack.js"), "pack.js");
        equal(Path("c:\\test\\test.pack.js").match("*pack.js"), "test.pack.js");
        equal(Path("c:\\test\\test2\\pack.js").match("*pack.js"), "pack.js");
        equal(Path("c:\\test\\test2\\test.pack.js").match("*pack.js"), "test.pack.js");

        ok(!Path("c:\\test\\test.js").match("*.txt"));
        ok(!Path("c:\\test\\test.js").match("test.txt"));
        ok(!Path("c:\\test\\test.js").match("test2.js"));
        ok(!Path("c:\\test\\test.js").match("test2\\*.js"));
        ok(!Path("c:\\test\\test.js").match("test2\\test.js"));
        ok(!Path("c:\\test\\testajs").match("test\\test.js"));

        equal(Path("test.js").match("*.*"), "test.js");
        equal(Path("test.pack.js").match("*.*"), "test.pack.js");
        equal(Path("\\test\\test.js").match("*.*"), "test.js");
        equal(Path("/test/test.js").match("*.*"), "test.js");
        equal(Path("c:\\test\\test.js").match("*.*"), "test.js");
        //equal(Path("test").match("*.*"), "test");
        //equal(Path("test").match("*."), "test");
        equal(Path("test").match("*"), "test");
        equal(Path("test.js").match("*"), "test.js");
        equal(Path("c:\\test\\test.js").match(".js"), ".js");
    });

    test("matchFolder", function() {
        equal(Path("c:\\path\\to\\test.txt").matchFolder("\\path"), "/path");
        equal(Path("c:\\path\\to\\test.txt").matchFolder("/path"), "/path");
        equal(Path("c:\\path\\to\\test.txt").matchFolder("\\path\\to"), "/path/to");
        equal(Path("c:\\path\\to\\test.txt").matchFolder("/path/to"), "/path/to");
        equal(Path("c:\\path\\to\\test.txt").matchFolder("c:\\path\\to"), "c:/path/to");
        equal(Path("c:\\path\\to\\test.txt").matchFolder("c:\\path/to"), "c:/path/to");
    });

    test("normalise", function () {
        equal(Path('test').toString(), 'test');
        equal(Path('../test').toString(), '../test');
        equal(Path('test1/../test2').toString(), 'test2');
        equal(Path('/test1/../test2').toString(), '/test2');
        equal(Path('/test1/../test2/../test3').toString(), '/test3');
        equal(Path('./test').toString(), 'test');
        equal(Path('test1/./test2').toString(), 'test1/test2');
        equal(Path('.././test1/../test2').toString(), '../test2');
        equal(Path('C:\\test\\..\\test.txt').toString(), 'C:/test.txt');
        equal(Path('C:\\test\\..\\.\\test.txt').toString(), 'C:/test.txt');
        equal(Path('..\\..\\test\\').toString(), '../../test/');
    });

    test("asPathIdentifier", function() {
        equal(Path('test.txt').asMarkupIdentifier().toString(), 'test');
        equal(Path('test/test.txt').asMarkupIdentifier().toString(), 'test-test');
    });
})();

(function () {
    var p;
    
    QUnit.module("templates", { setup: setup });

    test("scanForTemplates loads files and passes to loadConfig", function () {
        Pack.api.Files.files = {
            'test1.template.htm': '1',
            'test2.template.js': '2'
        };

        p.scanForTemplates();
        equal(p.templates.test1, '1');
        equal(p.templates.test2, '2');
    });


    QUnit.module("configs", { setup: setup });

    test("scanForConfigs loads files and passes to loadConfig", function () {
        Pack.api.Files.files = {
            'test.pack.js': 'pack();',
            'test.js': 'var test = "test";'
        };

        p.loadConfig = sinon.spy();
        p.scanForConfigs();
        ok(p.loadConfig.calledTwice);
        ok(p.loadConfig.calledWithExactly('test.pack.js', Pack.api.Files.files['test.pack.js']));
        ok(p.loadConfig.calledWithExactly('test.js', Pack.api.Files.files['test.js']));
    });

    test("loadConfig logs error when source has invalid syntax", function () {
        Pack.utils.logError = sinon.spy();
        p.loadConfig('path', 'invalid syntax');
        ok(Pack.utils.logError.calledOnce);
    });

    test("loadConfig logs error when source throws", function () {
        Pack.utils.logError = sinon.spy();
        p.loadConfig('path', 'throw "test";');
        ok(Pack.utils.logError.calledOnce);
        ok(Pack.utils.logError.calledWithExactly('test'));
    });

    test("loadConfig evaluates script with access to global scope", function () {
        p.loadConfig('path', 'this.globalTest = "test"');
        equal(globalTest, "test");
        delete globalTest;
    });

    test("loadConfig evaluates script in private scope", function () {
        p.loadConfig('path', 'var privateTest = "test"');
        raises(function () { var test3 = privateTest; });
    });
    
    function setup() {
        filesAsMock();
        p = new Pack();
    }
})();

(function () {
    QUnit.module("utils");

    test("executeSingleOrArray returns array if passed array", function () {
        var result = Pack.utils.executeSingleOrArray([1, 2], function (value) { return value * 2; });
        equal(result.length, 2);
        equal(result[0], 2);
        equal(result[1], 4);
    });

    test("executeSingleOrArray handles arguments object", function () {
        (function() {
            var result = Pack.utils.executeSingleOrArray(arguments, function() { });
            equal(result.length, 3);
        })(1, 2, 3);
    });

    test("executeSingleOrArray flattens arrays if requested", function () {
        var result = Pack.utils.executeSingleOrArray([1, [2, 3]], function () { }, true);
        equal(result.length, 3);
    });
})();

(function () {
    QUnit.module("transforms.files", { setup: filesAsSpy });

    test("include calls getFilenames with correct arguments when string is passed", function () {
        Pack.transforms.include.apply(wrap('*.js', new Pack.Output({ recursive: true }, 'path/'), new Pack.Container()));
        ok(Pack.api.Files.getFilenames.calledOnce);
        ok(Pack.api.Files.getFilenames.calledWithExactly('path/*.js', true));
    });

    test("include calls getFilenames with correct arguments when object is passed", function () {
        Pack.transforms.include.apply(wrap({ files: '*.js', recursive: false }, new Pack.Output({ recursive: true }, 'path/'), new Pack.Container()));
        ok(Pack.api.Files.getFilenames.calledOnce);
        ok(Pack.api.Files.getFilenames.calledWithExactly('path/*.js', false));
    });

    test("include calls getFilenames with correct arguments when function is passed", function () {
        Pack.transforms.include.apply(wrap(function() { return { files: '*.js', recursive: false }; }, new Pack.Output({ recursive: true }, 'path/'), new Pack.Container()));
        ok(Pack.api.Files.getFilenames.calledOnce);
        ok(Pack.api.Files.getFilenames.calledWithExactly('path/*.js', false));
    });

    test("include calls getFilenames with correct arguments when function is passed and no list exists", function () {
        Pack.transforms.include.apply(wrap(function () { }, new Pack.Output({ recursive: true }, 'path/'), new Pack.Container()));
        ok(Pack.api.Files.getFilenames.calledOnce);
        ok(Pack.api.Files.getFilenames.calledWithExactly('path/*.*', true));
    });

    test("include calls getFilenames twice when two values are passed", function() {
        Pack.transforms.include.apply(wrap(['*.js', { files: '*.txt', recursive: true }], new Pack.Output({}, 'path/'), new Pack.Container()));
        ok(Pack.api.Files.getFilenames.calledTwice);
        ok(Pack.api.Files.getFilenames.calledWithExactly('path/*.js', false));
        ok(Pack.api.Files.getFilenames.calledWithExactly('path/*.txt', true));
    });

    test("include values can be nested recursively", function() {
        Pack.transforms.include.apply(wrap(['*.js', ['*.htm', ['*.css']]], new Pack.Output({}, 'path/'), new Pack.Container()));
        ok(Pack.api.Files.getFilenames.calledThrice);
        ok(Pack.api.Files.getFilenames.calledWithExactly('path/*.js', false));
        ok(Pack.api.Files.getFilenames.calledWithExactly('path/*.htm', false));
        ok(Pack.api.Files.getFilenames.calledWithExactly('path/*.css', false));
    });

    test("include sets config and include path values", function() {
        Pack.api.Files.getFilenames = sinon.stub().returns(['path/subfolder/file']);
        var output = new Pack.Output({}, 'path/');
        var data = new Pack.Container();
        Pack.transforms.include.apply(wrap('subfolder/*.js', output, data));
        equal(data.files.list.length, 1);
        equal(data.files.list[0].includePath.toString(), 'path/subfolder/');
        equal(data.files.list[0].pathRelativeToInclude.toString(), 'file');
        equal(data.files.list[0].configPath.toString(), 'path/');
        equal(data.files.list[0].pathRelativeToConfig.toString(), 'subfolder/file');
    });

    test("setting template include option overrides template transform value", function() {
        Pack.api.Files.getFilenames = sinon.stub().returns(['file']);
        var output = new Pack.Output({ template: 'test1' }, 'path/');
        var data = new Pack.Container();
        Pack.transforms.include.apply(wrap([{ template: 'test2' }], output, data));
        equal(data.files.list.length, 1);
        equal(data.files.list[0].template, 'test2');
    });

    test("prioritise moves single file to top of file list", function () {
        var output = new Pack.Output({}, 'path/');
        var data = new Pack.Container();
        Pack.api.Files.getFilenames = sinon.stub().returns(['file1', 'file2', 'file3']);
        Pack.transforms.include.apply(wrap({ prioritise: 'file2' }, output, data));
        equal(data.files.list.length, 3);
        equal(data.files.list[0].path, 'file2');
        equal(data.files.list[1].path, 'file1');
        equal(data.files.list[2].path, 'file3');
    });

    test("prioritise moves array of files to top of file list", function () {
        Pack.api.Files.getFilenames = sinon.stub().returns(['file1', 'file2', 'file3']);
        var output = new Pack.Output({}, 'path/');
        var data = new Pack.Container();
        Pack.transforms.include.apply(wrap({ prioritise: ['file3', 'file2'] }, output, data));
        
        equal(data.files.list.length, 3);
        equal(data.files.list[0].path, 'file3');
        equal(data.files.list[1].path, 'file2');
        equal(data.files.list[2].path, 'file1');
    });
    
    test("first is an alias for prioritise", function () {
        equal(Pack.transforms.first.apply, Pack.transforms.prioritise.apply);
    });

    test("last moves single file to bottom of file list", function () {
        var output = new Pack.Output({}, 'path/');
        var data = new Pack.Container();
        Pack.api.Files.getFilenames = sinon.stub().returns(['file1', 'file2', 'file3']);
        Pack.transforms.include.apply(wrap({ last: 'file2' }, output, data));
        equal(data.files.list.length, 3);
        equal(data.files.list[0].path, 'file1');
        equal(data.files.list[1].path, 'file3');
        equal(data.files.list[2].path, 'file2');
    });

    test("last moves array of files to bottom of file list", function () {
        Pack.api.Files.getFilenames = sinon.stub().returns(['file1', 'file2', 'file3']);
        var output = new Pack.Output({}, 'path/');
        var data = new Pack.Container();
        Pack.transforms.include.apply(wrap({ last: ['file1', 'file2'] }, output, data));

        equal(data.files.list.length, 3);
        equal(data.files.list[0].path, 'file3');
        equal(data.files.list[1].path, 'file1');
        equal(data.files.list[2].path, 'file2');
    });

    test("excludeDefaults excludes config files", function () {
        var data = { files: new Pack.FileList('1', '3') };
        Pack.transforms.excludeDefaults.apply(wrap(true, { transforms: {} }, data), { loadedConfigs: ['3'] });
        equal(data.files.list.length, 1);
        equal(data.files.list[0].path, '1');
    });

    test("excludeDefaults includes config files if includeConfigs transform is specified", function() {
        var data = { files: new Pack.FileList('1', '3') };
        Pack.transforms.excludeDefaults.apply(wrap(true, { transforms: { includeConfigs: true } }, data), { loadedConfigs: ['3'] });
        equal(data.files.list.length, 2);
    });
    
    test("excludeDefaults excludes output file", function () {
        var data = { files: new Pack.FileList('1', '3') };
        Pack.transforms.excludeDefaults.apply(wrap(true, { outputPath: '3', transforms: { } }, data), {});
        equal(data.files.list.length, 1);
        equal(data.files.list[0].path, '1');
    });

})();

(function () {
    QUnit.module("transforms.minify", { setup: minifierAsSpy });
    
    test("minify calls appropriate API functions", function () {        
        Pack.transforms.minify.apply(wrap(true, { transforms: { to: 'test.js' } }, { output: 'js' }));
        Pack.transforms.minify.apply(wrap(true, { transforms: { to: 'test.htm' } }, { output: 'htm' }));
        Pack.transforms.minify.apply(wrap(true, { transforms: { to: 'test.css' } }, { output: 'css' }));

        ok(Pack.api.MinifyJavascript.minify.calledWithExactly('js'));
        ok(Pack.api.MinifyMarkup.minify.calledWithExactly('htm'));
        ok(Pack.api.MinifyStylesheet.minify.calledWithExactly('css'));
    });
})();

(function () {
    QUnit.module("transforms.content", { setup: filesAsSpy });

    test("load calls getFileContents passing file names", function () {
        Pack.transforms.load.apply(wrap(true, {}, { files: new Pack.FileList('1', '3') }));
        ok(Pack.api.Files.getFileContents.calledOnce);
        deepEqual(Pack.api.Files.getFileContents.firstCall.args[0], ['1', '3']);
    });
    

    QUnit.module("transforms.output", { setup: filesAsSpy });

    test("combine joins all files contents", function () {
        var data = { files: new Pack.FileList({ path: 'file1', content: '1' }, { path: 'file2', content: '2' }, { path: 'file3', content: '3' }) };
        Pack.transforms.combine.apply(wrap(true, {}, data));
        equal(data.output, '1\n2\n3');
    });


    QUnit.module("transforms.finalise", { setup: filesAsSpy });

    test("write calls writeFile with correct arguments", function () {
        var output = new Pack.Output({ to: '../test.txt' }, 'C:\\temp\\');
        var data = { output: 'test' };
        Pack.transforms.to.apply(wrap(true, output, data));
        ok(Pack.api.Files.writeFile.calledOnce);
        ok(Pack.api.Files.writeFile.calledWithExactly('C:/test.txt', 'test'));
    });
})();

(function () {
    QUnit.module("transforms.outputTemplate");

    test("outputTemplate renders underscore template", function () {
        var data = { output: '' };
        var pack = { templates: { 'template': 'templatecontent' } };
        Pack.transforms.outputTemplate.apply(wrap('template', { transforms: { to: 'test' } }, data), pack);

        equal(data.output, 'templatecontent');
    });

    test("outputTemplate renders multiple underscore templates", function () {
        var data = { output: '' };
        var pack = { templates: { 'template': 'templatecontent', 'template2': '<%=content%>2' } };
        Pack.transforms.outputTemplate.apply(wrap(['template', 'template2'], { transforms: { to: 'test' } }, data), pack);

        equal(data.output, '\ntemplatecontent2');
    });

    test("outputTemplate renders passed data", function () {
        var data = { output: 'content' };
        var pack = { templates: { 'template': '<%=content%><%=data.value%>' } };
        Pack.transforms.outputTemplate.apply(wrap({ name: 'template', data: { value: 'testValue' } }, { transforms: { to: 'test' } }, data), pack);

        equal(data.output, '\ncontenttestValue');
    });
})();

(function () {
    QUnit.module("transforms.syncTo", { setup: filesAsSpy });

    var data = {
        files: {
            list: [
                { path: '/path/to1/file1', pathRelativeToInclude: 'to1/file1' },
                { path: '/path/to2/file2', pathRelativeToInclude: 'to2/file2' }
            ],
            paths: function () { }
        }
    };

    test("syncTo executes copy for each file in list", function () {
        Pack.transforms.syncTo.apply(wrap('target/path', new Pack.Output({}, 'path/'), data));
        ok(Pack.api.Files.copy.calledTwice);
        deepEqual(Pack.api.Files.copy.firstCall.args, ['/path/to1/file1', 'path/target/path/to1/file1']);
        deepEqual(Pack.api.Files.copy.secondCall.args, ['/path/to2/file2', 'path/target/path/to2/file2']);
    });

    test("syncTo handles absolute paths", function() {
        Pack.transforms.syncTo.apply(wrap('/target/path/', new Pack.Output({}, 'path/'), data));
        ok(Pack.api.Files.copy.calledTwice);
        deepEqual(Pack.api.Files.copy.firstCall.args, ['/path/to1/file1', 'path/target/path/to1/file1']);
        deepEqual(Pack.api.Files.copy.secondCall.args, ['/path/to2/file2', 'path/target/path/to2/file2']);
    });
})();

(function () {
    QUnit.module("transforms.template");

    test("template renders underscore template", function () {
        var data = { files: new Pack.FileList({ path: 'filepath', content: 'filecontent' }) };
        var pack = mockPack({ 'template': 'templatecontent' });
        Pack.transforms.template.apply(wrap('template', {}, data), pack);

        equal(data.files.list.length, 1);
        equal(data.files.list[0].content, 'templatecontent');
    });

    test("template renders multiple underscore templates", function () {
        var data = { files: new Pack.FileList({ path: 'filepath', content: 'filecontent' }) };
        var pack = mockPack({ 'template': 'templatecontent', 'template2': '<%=content%>2' });
        Pack.transforms.template.apply(wrap(['template', 'template2'], {}, data), pack);

        equal(data.files.list.length, 1);
        equal(data.files.list[0].content, '\ntemplatecontent2');
    });

    test("template renders built-in data", function () {
        var output = { basePath: '/test/' };
        var data = { files: new Pack.FileList({ path: '/test/files/file', content: 'content', filespec: '/files/*.*', configPath: '/test/', pathRelativeToConfig: 'files/file', includePath: '/test/files/', pathRelativeToInclude: 'file' }) };
        var pack = mockPack({ 'template': '<%=path%>|<%=content%>|<%=configPath%>|<%=pathRelativeToConfig%>|<%=includePath%>|<%=pathRelativeToInclude%>' });
        Pack.transforms.template.apply(wrap('template', output, data), pack);

        equal(data.files.list.length, 1);
        equal(data.files.list[0].content, '/test/files/file|\ncontent|/test/|files/file|/test/files/|file');
    });

    test("template name can be specified with an object", function () {
        var data = { files: new Pack.FileList({ path: 'filepath', content: 'filecontent' }) };
        var pack = mockPack({ 'template': 'templatecontent' });
        Pack.transforms.template.apply(wrap({ name: 'template' }, {}, data), pack);

        equal(data.files.list.length, 1);
        equal(data.files.list[0].content, 'templatecontent');
    });

    test("data specified in include transform overrides data in template transform", function() {
        var data = { files: new Pack.FileList({ path: 'filepath', content: 'filecontent', template: { name: 'template', data: { additionalData: 'add1' } } }) };
        var pack = mockPack({ 'template': '<%=data.additionalData%>' });
        Pack.transforms.template.apply(wrap({ name: 'template', data: { additionalData: 'add2' } }, {}, data), pack);

        equal(data.files.list.length, 1);
        equal(data.files.list[0].content, 'add1');
    });

    test("Path objects can be used in templates", function () {
        var data = { files: new Pack.FileList({ path: 'path/file.txt', content: 'filecontent' }) };
        var pack = mockPack({ 'template': '<%=path.withoutFilename()%>' });
        Pack.transforms.template.apply(wrap('template', {}, data), pack);

        equal(data.files.list.length, 1);
        equal(data.files.list[0].content, 'path/');
    });

    test("When function is passed as template value, actual value is set from function evaluation", function () {
        expect(4);
        var output = {};
        var data = { files: new Pack.FileList({ path: 'filepath', content: 'filecontent' }) };
        var pack = mockPack({ 'template': 'templatecontent' });
        Pack.transforms.template.apply(wrap(function(currentOutput, target) {
            equal(currentOutput, output);
            equal(target, data);
            return 'template';
        }, output, data), pack);

        equal(data.files.list.length, 1);
        equal(data.files.list[0].content, 'templatecontent');
    });
    
    function mockPack(templates) {
        return { templates: templates };
    }
})();

(function () {
    var t;
    
    QUnit.module("transforms", {
        setup: function () {
            t = new Pack.TransformRepository();
        }
    });

    test("transform function is called with correct arguments", function () {
        var spy = sinon.spy();
        t.add('name', 'event', spy);
        t.events = ['event'];
        t.applyTo(new Pack.Output({ name: 'test' }, 'path/config'));

        ok(spy.calledOnce);
        equal(spy.firstCall.args[0].value, 'test');
        equal(spy.firstCall.args[0].output.basePath, 'path/');
    });

    test("transform functions are executed in event order", function() {
        var spy = sinon.spy();
        t.add('transform1', 'event1', spy);
        t.add('transform2', 'event2', spy);
        t.events = ['event1', 'event2'];
        t.applyTo(new Pack.Output({ transform2: '2', transform1: '1' }));

        ok(spy.calledTwice);
        equal(spy.firstCall.args[0].value, '1');
        equal(spy.secondCall.args[0].value, '2');
    });

    test("transform functions are executed in order specified", function() {
        var spy = sinon.spy();
        t.add('transform1', 'event', spy);
        t.add('transform2', 'event', spy);
        t.events = ['event'];
        t.applyTo(new Pack.Output({ transform2: '2', transform1: '1' }));

        ok(spy.calledTwice);
        equal(spy.firstCall.args[0].value, '2');
        equal(spy.secondCall.args[0].value, '1');
    });

    test("defaultTransforms are executed before others in event", function () {
        var spy = sinon.spy();
        t.events = ['event1', 'event2'];
        t.add('transform1', 'event1', spy);
        t.add('transform2', 'event2', spy);
        t.add('default', 'event2', spy);
        t.defaultTransforms = { 'default': 'default' };
        t.applyTo(new Pack.Output({ transform1: '1', transform2: '2' }));

        ok(spy.calledThrice);
        equal(spy.firstCall.args[0].value, '1');
        equal(spy.secondCall.args[0].value, 'default');
        ok(spy.thirdCall.args[0].value, '2');
    });
})();

integrationTest('Combine', function(output) {
    output('nonrecursive').equals('root.js\nroot.txt');
    output('recursive').equals('root.js\nroot.txt\nsubfolder.js\nsubfolder.txt');
    output('individualIncludes').equals('root.js\nsubfolder.js\nroot.txt');
    output('subfolder').equals('subfolder.js\nsubfolder.txt');
    output('excludes').equals('root.js\nsubfolder.js');
    output('simplePrioritise').equals('root.txt\nroot.js');
    output('prioritise').equals('root.txt\nsubfolder.txt\nroot.js\nsubfolder.js');
    output('last').equals('root.js\nsubfolder.js\nroot.txt\nsubfolder.txt');
    output('multiple1').equals('root.js\nroot.txt');
    output('multiple2').equals('root.txt\nroot.js');
    output('alternate').equals('root.js\nroot.txt');
    output('alternateArray').equals('root.js\nsubfolder.js');
});

(function() {
    integrationTest('ConfigChange', 'Modify config file triggers build', function(output, api) {
        equal(Pack.api.Files.writeFile.callCount, 1);
        triggerChange('update');
        equal(Pack.api.Files.writeFile.callCount, 2);
    });

    integrationTest('ConfigChange', 'Add config file triggers build', function(output, api) {
        triggerChange('create');
        equal(Pack.api.Files.writeFile.callCount, 2);
    });

    integrationTest('ConfigChange', 'Delete config file removes old config', function(output, api) {
        triggerChange('delete');
        equal(pack.outputs.length, 0);
    });

    integrationTest('ConfigChange', 'Delete config file does not trigger build', function(output, api) {
        equal(Pack.api.Files.writeFile.callCount, 1);
        triggerChange('delete');
        equal(Pack.api.Files.writeFile.callCount, 1);
    });

    function triggerChange(type) {
        pack.fileChanged(fullPath('pack.js'), type);
    }

    function fullPath(path) {
        return 'Tests/Integration/ConfigChange/' + path;
    }
})();

integrationTest('ConfigLoad', 'scanForConfigs passes correct arguments to getFilenames', function(output, api) {
    equal(Pack.api.Files.getFilenames.firstCall.args[0], "Tests/Integration/ConfigLoad/*pack.config.js");
    equal(Pack.api.Files.getFilenames.secondCall.args[0], "Tests/Integration/ConfigLoad/*pack.js");
});

integrationTest('ConfigLoad', 'Config files are loaded in expected order', function(output, api) {
    deepEqual(pack.test, ["subfolder config loaded", "named config loaded", "root folder loaded", "subfolder loaded"]);
});

integrationTest('Embedded', function(output) {
    output('styles').containsOnce("__appendStyle = function");
    output('templates').containsOnce("__appendTemplate = function");
});

integrationTest('ExcludeConfigAndTarget', function (output) {
    output("output.js").equals("root.js");    
});

integrationTest('ExcludedDirectories', function(output) {
    output('excluded').equals(undefined);
});

(function() {
    integrationTest('FileChange', 'Modify excluded file does not trigger build', function(output, api) {
        pack.fileChanged(fullPath("input.txt"), "update");
        equal(Pack.api.Files.writeFile.callCount, 1);
    });

    integrationTest('FileChange', 'Modify included file triggers build', function(output, api) {
        pack.fileChanged(fullPath("input.js"), "update");
        equal(Pack.api.Files.writeFile.callCount, 2);
    });

    integrationTest('FileChange', 'Add excluded file does not trigger build', function(output, api) {
        pack.fileChanged(fullPath("input.txt"), "create");
        equal(Pack.api.Files.writeFile.callCount, 1);
    });

    integrationTest('FileChange', 'Add included file triggers build', function(output, api) {
        pack.fileChanged(fullPath("input.js"), "create");
        equal(Pack.api.Files.writeFile.callCount, 2);
    });

    integrationTest('FileChange', 'Add template rereads template', function(output, api) {
        pack.fileChanged(fullPath("input.template.js"), "create");
        equal(Pack.api.Files.getFileContents.lastCall.args[0], fullPath("input.template.js"));
    });

    integrationTest('FileChange', 'Delete excluded file does not trigger build', function(output, api) {
        pack.fileChanged(fullPath("input.txt"), "delete");
        equal(Pack.api.Files.writeFile.callCount, 1);
    });

    integrationTest('FileChange', 'Delete included file triggers build', function(output, api) {
        pack.fileChanged(fullPath("input.js"), "delete");
        equal(Pack.api.Files.writeFile.callCount, 2);
    });


    function fullPath(file) {
        return 'Tests/Integration/FileChange/' + file;
    }
})();

(function() {
    QUnit.module('Integration.Files', { setup: filesAsOriginal });

    test("getFilenames returns array of files in specified folder", function() {
        var files = Pack.api.Files.getFilenames(fullPath('*.*'));
        equal(files.length, 1);
        equal(files[0], fullPath('root.txt'));
    });

    test("getFilenames recurses when specified", function() {
        var files = Pack.api.Files.getFilenames(fullPath('*.*'), true);
        equal(files.length, 2);
        equal(files[0], fullPath('root.txt'));
        equal(files[1], fullPath('Child/child.txt'));
    });

    test("getFileContents returns string contents of specified file", function() {
        equal(Pack.api.Files.getFileContents(fullPath('root.txt')), 'root');
    });

    test("getFileContents returns hash of path to string contents for specified array of files", function() {
        var contents = Pack.api.Files.getFileContents([fullPath('root.txt'), fullPath('Child/child.txt')]);
        equal(contents[fullPath('root.txt')], 'root');
        equal(contents[fullPath('Child/child.txt')], 'child');
    });

    test("writeFile writes specified string to target file", function() {
        var value = _.random(1, 10);
        Pack.api.Files.writeFile(fullPath('test.txt'), value);
        equal(Pack.api.Files.getFileContents(fullPath('test.txt')), value);
        require('fs').unlinkSync(fullPath('test.txt'));
    });

    test("copy copies specified source file to target", function() {
        var value = _.random(1, 10);
        Pack.api.Files.copy(fullPath('root.txt'), fullPath(value));
        equal(Pack.api.Files.getFileContents(fullPath(value)), 'root');
        require('fs').unlinkSync(fullPath(value));
    });
    
    function fullPath(path) {
        return 'Tests/Integration/Files/' + path;
    }
})();

integrationTest('Json', function(output) {
    output('json').equals('{"string":"test","number":2.2,"bool":true}');
});

integrationTest('Minify', function(output) {
    output('javascript.js').equals('function name(n){var r=n;return r}');
    //output('markup.htm').equals('<html>\r\n    <body></body>\r\n</html>');
    output('stylesheet.css').equals('.class{display:none}');
});

integrationTest('OutputTemplate', function(output) {
    output('outputTemplate').equals("// license\r\n\nfunction");
});

integrationTest('Recursive', function(output) {
    equal(Pack.api.Files.writeFile.callCount, 6);
    output("final").equals("1.js\n2.js");
    output("subfolder").equals("3.js\n4.js");

    pack.fileChanged("Tests/Integration/Recursive/1.js", "update");
    equal(Pack.api.Files.writeFile.callCount, 8);

    pack.fileChanged("Tests/Integration/Recursive/3.js", "update");
    equal(Pack.api.Files.writeFile.callCount, 10);
});

integrationTest('Sync', function (output) {
    var copy = Pack.api.Files.copy;
    equal(copy.firstCall.args[0], 'Tests/Integration/Sync/test.js');
    equal(copy.firstCall.args[0], fullPath('Sync/test.js'), 'simple');
    equal(copy.firstCall.args[1], fullPath('TestOutput/Sync/Simple/test.js'), 'simple');

    equal(copy.secondCall.args[0], fullPath('Sync/Child/test.js'), 'child');
    equal(copy.secondCall.args[1], fullPath('TestOutput/Sync/Child/test.js'), 'child');

    equal(copy.thirdCall.args[0], fullPath('Sync/test.js'), 'recursive');
    equal(copy.thirdCall.args[1], fullPath('TestOutput/Sync/Recursive/test.js'), 'recursive');
    equal(copy.getCall(3).args[0], fullPath('Sync/Child/test.js'), 'recursive');
    equal(copy.getCall(3).args[1], fullPath('TestOutput/Sync/Recursive/Child/test.js'), 'recursive');

    equal(copy.getCall(4).args[0], fullPath('Sync/test.js'), 'alternate');
    equal(copy.getCall(4).args[1], fullPath('TestOutput/Sync/Alternate/test.js'), 'alternate');

    function fullPath(path) {
        return 'Tests/Integration/' + path;
    }
});

integrationTest('Template', function (output) {    
    output('builtinData').contains('Tests/Integration/Template/root.txt\r\n', 'path');
    output('builtinData').contains('root\r\n', 'content');
    output('builtinData').contains('Tests/Integration/Template/\r\n', 'configPath');
    output('builtinData').contains('root.txt\r\n', 'pathRelativeToConfig');

    output('builtinData').contains('Tests/Integration/Template/Subfolder/subfolder.txt\r\n', 'path');
    output('builtinData').contains('subfolder\r\n', 'content');
    output('builtinData').contains('Tests/Integration/Template/\r\n', 'configPath');
    output('builtinData').contains('Subfolder/subfolder.txt\r\n', 'pathRelativeToConfig');
    
    output('passedData').equals('test2');
    
    output('separateTemplates').contains('root1');
    output('separateTemplates').contains('subfolder2');
    
    output('pathRelativeToInclude').contains('subfolder.txt\r\n');
    output('pathRelativeToInclude').contains('Subfolder2/subfolder2.js\r\n');
});

integrationTest('Zip', function (output) {
    var zip = output.zip('Simple.zip');
    equal(zip['test.js'].data, 'root');

    zip = output.zip('Child.zip');
    equal(zip['test.js'].data, 'child');
    
    zip = output.zip('Recursive.zip');
    equal(zip['test.js'].data, 'root');
    equal(zip['Child/test.js'].data, 'child');
});

//// namespace('Test.test1');
//// func({ name: 'blah', 
////     description: 'test
////                   test', arguments: [{}], returns: 'test' });
function blah() { }
QUnit.module('Embedded.T.document');

var source = loadSource();

test("extractDocumentation trims and concatenates", function () {
    var d = T.document.extractDocumentation("test\n   ////    { \n////           test: 'test\n////description'\ntest\n////}");
    equal(d, "{ test: 'test description' }");
});

test("findOrCreateNamespace finds existing namespace", function() {
    var target = { test1: { test2: { test3: {} } } };
    equal(T.document.findOrCreateNamespace(target, 'test1.test2'), target.test1.test2);
});

test("findOrCreateNamespace creates new namespace", function () {
    var target = { };
    equal(T.document.findOrCreateNamespace(target, 'test1.test2'), target.test1.test2);
});

test("captureMembers constructs namespace tree", function() {
    var documentation = T.document.extractDocumentation(source);
    var result = T.document.captureMembers(documentation);
    ok(result.Test);
    ok(result.Test.test1);
    ok(result.Test.test1.functions);
    equal(result.Test.test1.functions.length, 1);
    equal(result.Test.test1.functions[0].name, 'blah');
});

test("captureMembers logs error if documentation is invalid", function() {
    log = { error: sinon.spy() };
    T.document.captureMembers('invalid javascript');
    ok(log.error.calledOnce);
});

function loadSource() {
    //var result;
    //$.ajax({
    //    url: 'Core/Embedded/source.js',
    //    async: false,
    //    success: function(content) {
    //        result = content;
    //    }
    //});
    //return result;
    return '//// namespace(\'Test.test1\');\n//// func({ name: \'blah\', \n////     description: \'test\n////                   test\', arguments: [{}], returns: \'test\' });\nfunction blah() { }';
}
QUnit.module('Embedded.T.scripts');

test("Specifying folder includes all js files", function() {
    var include = T.scripts('Scripts');
    equal(include.files, 'Scripts/*.js');
});

test("Specifying file includes single file", function () {
    var include = T.scripts('test.js');
    equal(include.files, 'test.js');
});

test("Specifying filespec includes filespec", function () {
    var include = T.scripts('Tests/*.tests.js');
    equal(include.files, 'Tests/*.tests.js');
});

test("T.Script template is used if debug is not specified", function () {
    var include = T.scripts('Scripts');
    var output = { transforms: {} };
    equal(include.template(output).name, 'T.Script');
});

test("T.Script.debug template is used if debug transform is specified", function () {
    var include = T.scripts('Scripts', true);
    var output = { transforms: { debug: true } };
    equal(include.template(output).name, 'T.Script.debug');
});

test("Path can be specified in object", function () {
    var include = T.scripts({ path: 'Scripts' });
    equal(include.files, 'Scripts/*.js');
});

test("Debug can be specified in object", function () {
    var include = T.scripts({ path: 'Scripts', debug: true });
    var output = { transforms: {} };
    equal(include.template(output).name, 'T.Script.debug');
});

QUnit.module('Embedded.T.panes');

test("T.panes includes relevant files from specified folder", function () {
    var includes = T.panes('Panes');
    equal(includes.length, 3);
    equal(includes[0].files, 'Panes/*.js');
    equal(includes[1].files, 'Panes/*.htm');
    equal(includes[2].files, 'Panes/*.css');
});

QUnit.module('Embedded.T.models');

test("T.models uses resource and script templates", function () {
    var include = T.models('Panes');
    var template = include.template({ transforms: {} });
    equal(template.length, 2);
    equal(template[0].name, 'T.Resource');
    equal(template[1].name, 'T.Script');
});