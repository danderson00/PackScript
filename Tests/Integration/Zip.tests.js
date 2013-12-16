integrationTest('Zip', function (output) {
    var zip = output.zip('Simple.zip');
    equal(zip['test.js'].data, 'root');

    zip = output.zip('Child.zip');
    equal(zip['test.js'].data, 'child');
    
    zip = output.zip('Recursive.zip');
    equal(zip['test.js'].data, 'root');
    equal(zip['Child/test.js'].data, 'child');
});
