integrationTest('Json', function(output) {
    output('json').equals('{"string":"test","number":2.2,"bool":true}');
});
