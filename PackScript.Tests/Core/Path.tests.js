(function () {
    module("Path");

    test('Path handles empty arguments', function() {
        equal(Path('').toString(), '');
        equal(Path(undefined).toString(), '');
        equal(Path(null).toString(), '');
    });

    test("withoutFilename", function () {
        equal(Path("/folder/subfolder/filename.ext").withoutFilename().toString(), "/folder/subfolder/", "Path with slashes");
        equal(Path("\\folder\\subfolder\\filename.ext").withoutFilename().toString(), "\\folder\\subfolder\\", "Path with backslashes");
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

    test("match", function () {
        equal(Path("test.js").match("test.js"), "test.js");
        equal(Path("test\\test.js").match("test.js"), "test.js");
        equal(Path("test.js").match("*.js"), "test.js");
        //ok(!Path("atest.js").match("test.js"));
        ok(!Path("test.jsa").match("test.js"));
        ok(!Path("test.jsa").match("*.js"));

        equal(Path("c:\\test\\test.js").match("test.js"), "test.js");
        equal(Path("c:\\test\\test.js").match("*.js"), "test.js");
        equal(Path("c:\\test\\test.js").match("test\\test.js"), "test\\test.js");
        equal(Path("c:\\test\\test.js").match("test\\*.js"), "test\\test.js");
        equal(Path("c:\\test\\test.js").match("test/test.js"), "test\\test.js");
        equal(Path("c:\\test\\test.js").match("test/*.js"), "test\\test.js");

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
        equal(Path("c:\\path\\to\\test.txt").matchFolder("\\path"), "\\path");
        equal(Path("c:\\path\\to\\test.txt").matchFolder("/path"), "\\path");
        equal(Path("c:\\path\\to\\test.txt").matchFolder("\\path\\to"), "\\path\\to");
        equal(Path("c:\\path\\to\\test.txt").matchFolder("/path/to"), "\\path\\to");
        equal(Path("c:\\path\\to\\test.txt").matchFolder("c:\\path\\to"), "c:\\path\\to");
        equal(Path("c:\\path\\to\\test.txt").matchFolder("c:\\path/to"), "c:\\path\\to");
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
        equal(Path('C:\\test\\..\\test.txt').toString(), 'C:\\test.txt');
        equal(Path('C:\\test\\..\\.\\test.txt').toString(), 'C:\\test.txt');
        equal(Path('..\\..\\test\\').toString(), '..\\..\\test\\');
    });

    test("asPathIdentifier", function() {
        equal(Path('test.txt').asMarkupIdentifier().toString(), 'test');
        equal(Path('test/test.txt').asMarkupIdentifier().toString(), 'test-test');
    });
})();
