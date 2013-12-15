integrationTest('ExcludeConfigAndTarget', function (output) {
    output("output.js").equals("root.js");    
});
