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