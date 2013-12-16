integrationTest('OutputTemplate', function(output) {
    output('outputTemplate').equals("// license\r\nfunction");
});
