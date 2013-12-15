(function() {

    integrationTest('FileChange', 'Modify excluded file does not trigger build', function(output, api) {
        pack.fileChanged(fullPath("input.txt"), fullPath("input.txt"), "modify");
        equal(Pack.api.Files.writeFile.callCount, 1);
    });

    integrationTest('FileChange', 'Modify included file triggers build', function(output, api) {
        pack.fileChanged(fullPath("input.js"), fullPath("input.js"), "modify");
        equal(Pack.api.Files.writeFile.callCount, 2);
    });

    integrationTest('FileChange', 'Add excluded file does not trigger build', function(output, api) {
        pack.fileChanged(fullPath("input.txt"), fullPath("input.txt"), "add");
        equal(Pack.api.Files.writeFile.callCount, 1);
    });

    integrationTest('FileChange', 'Add included file triggers build', function(output, api) {
        pack.fileChanged(fullPath("input.js"), fullPath("input.js"), "add");
        equal(Pack.api.Files.writeFile.callCount, 2);
    });

    integrationTest('FileChange', 'Add template rereads template', function(output, api) {
        pack.fileChanged(fullPath("input.template.js"), fullPath("input.template.js"), "add");
        equal(Pack.api.Files.getFileContents.lastCall.args[0], fullPath("input.template.js"));
    });

    integrationTest('FileChange', 'Delete excluded file does not trigger build', function(output, api) {
        pack.fileChanged(fullPath("input.txt"), fullPath("input.txt"), "delete");
        equal(Pack.api.Files.writeFile.callCount, 1);
    });

    integrationTest('FileChange', 'Delete included file triggers build', function(output, api) {
        pack.fileChanged(fullPath("input.js"), fullPath("input.js"), "delete");
        equal(Pack.api.Files.writeFile.callCount, 2);
    });

    integrationTest('FileChange', 'Rename excluded file does not trigger build', function(output, api) {
        pack.fileChanged(fullPath("input2.txt"), fullPath("input.txt"), "rename");
        equal(Pack.api.Files.writeFile.callCount, 1);
    });

    integrationTest('FileChange', 'Rename included file triggers build', function(output, api) {
        pack.fileChanged(fullPath("input2.js"), fullPath("input.js"), "rename");
        equal(Pack.api.Files.writeFile.callCount, 2);
    });


    function fullPath(file) {
        return 'Tests/Integration/FileChange/' + file;
    }
})();
