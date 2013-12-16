integrationTest('Embedded', function(output) {
    output('styles').containsOnce("__appendStyle = function");
    output('templates').containsOnce("__appendTemplate = function");
});
