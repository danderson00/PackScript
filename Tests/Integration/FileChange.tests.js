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
