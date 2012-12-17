Context = {};

function filesAsMock() {
    Files = {
        getFilenames: function(path, filter, recursive) {
            return _.keys(Files.files);
        },
        getFileContents: function(files) {
            var result = {};
            for (var i = 0; i < files.length; i++)
                result[files[i]] = Files.files[files[i]];
            return result;
        },
        writeFile: function(path, content) {
            Files.files[path] = content;
        },
        files: {}
    };
};

function filesAsSpy() {
    Files = {
        getFilenames: sinon.spy(),
        getFileContents: sinon.spy(),
        writeFile: sinon.spy()
    };
};

Log = {
    debug: function (message) {
        console.log('DEBUG: ' + message);
    },
    info: function (message) {
        console.log('INFO: ' + message);
    },
    warn: function (message) {
        console.log('WARN: ' + message);
    },
    error: function (message) {
        console.log('ERROR: ' + message);
    },
};

function minifierAsSpy() {
    MinifyJavascript = { minify: sinon.spy() };
    MinifyMarkup = { minify: sinon.spy() };
    MinifyStylesheet = { minify: sinon.spy() };
}