function filesForIntegration(p) {
    p.api.Files = {
        getFilenames: function (filespec, recursive) {
            return Pack.api.Files.getFilenames(filespec, recursive);
        },
        getFileContents: function (files) {
            return Pack.api.Files.getFileContents(files);
        },
        writeFile: sinon.spy(),
        copyFile: sinon.spy()
    };
}