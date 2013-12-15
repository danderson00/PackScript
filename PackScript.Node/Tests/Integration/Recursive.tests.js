integrationTest('Recursive', function(output) {
    equal(Pack.api.Files.writeFile.callCount, 6);
    output("final").equals("1.js2.js");
    output("subfolder").equals("3.js4.js");

    pack.fileChanged("Tests/Integration/Recursive/1.js", "Tests/Integration/Recursive/1.js", "modify");
    equal(Pack.api.Files.writeFile.callCount, 8);

    pack.fileChanged("Tests/Integration/Recursive/3.js", "Tests/Integration/Recursive/3.js", "modify");
    equal(Pack.api.Files.writeFile.callCount, 10);
});
