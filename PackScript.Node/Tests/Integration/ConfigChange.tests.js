(function() {

    integrationTest('ConfigChange', 'Modify config file triggers build', function(output, api) {
        equal(Pack.api.Files.writeFile.callCount, 1);
        triggerChange('modify');
        equal(Pack.api.Files.writeFile.callCount, 2);
    });

    integrationTest('ConfigChange', 'Add config file triggers build', function(output, api) {
        triggerChange('add');
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

    integrationTest('ConfigChange', 'Rename config file removes old config', function(output, api) {
        equal(pack.outputs.length, 1);
        pack.fileChanged(fullPath('renamed.pack.js'), fullPath('pack.js'), 'rename');
        equal(pack.outputs.length, 0);
    });

    integrationTest('ConfigChange', 'Rename config file triggers build', function(output, api) {
        equal(Pack.api.Files.writeFile.callCount, 1);
        triggerChange('rename');
        equal(Pack.api.Files.writeFile.callCount, 2);
    });

    function triggerChange(type) {
        pack.fileChanged(fullPath('pack.js'), fullPath('pack.js'), type);
    }

    function fullPath(path) {
        return 'Tests/Integration/ConfigChange/' + path;
    }
})();
