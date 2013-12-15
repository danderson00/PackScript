integrationTest('ConfigLoad', 'scanForConfigs passes correct arguments to getFilenames', function(output, api) {
    equal(Pack.api.Files.getFilenames.firstCall.args[0], "Tests/Integration/ConfigLoad/*pack.config.js");
    equal(Pack.api.Files.getFilenames.secondCall.args[0], "Tests/Integration/ConfigLoad/*pack.js");
});

integrationTest('ConfigLoad', 'Config files are loaded in expected order', function(output, api) {
    deepEqual(pack.test, ["subfolder config loaded", "named config loaded", "root folder loaded", "subfolder loaded"]);
});
