integrationTest('Template', function (output) {    
    output('builtinData').contains('Tests/Integration/Template/root.txt\r\n', 'path');
    output('builtinData').contains('root\r\n', 'content');
    output('builtinData').contains('Tests/Integration/Template/\r\n', 'configPath');
    output('builtinData').contains('root.txt\r\n', 'pathRelativeToConfig');

    output('builtinData').contains('Tests/Integration/Template/Subfolder/subfolder.txt\r\n', 'path');
    output('builtinData').contains('subfolder\r\n', 'content');
    output('builtinData').contains('Tests/Integration/Template/\r\n', 'configPath');
    output('builtinData').contains('Subfolder/subfolder.txt\r\n', 'pathRelativeToConfig');
    
    output('passedData').equals('test2');
    
    output('separateTemplates').contains('root1');
    output('separateTemplates').contains('subfolder2');
    
    output('pathRelativeToInclude').contains('subfolder.txt\r\n');
    output('pathRelativeToInclude').contains('Subfolder2/subfolder2.js\r\n');
});
