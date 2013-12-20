integrationTest('Combine', function(output) {
    output('nonrecursive').equals('root.js\nroot.txt');
    output('recursive').equals('root.js\nroot.txt\nsubfolder.js\nsubfolder.txt');
    output('individualIncludes').equals('root.js\nsubfolder.js\nroot.txt');
    output('subfolder').equals('subfolder.js\nsubfolder.txt');
    output('excludes').equals('root.js\nsubfolder.js');
    output('simplePrioritise').equals('root.txt\nroot.js');
    output('prioritise').equals('root.txt\nsubfolder.txt\nroot.js\nsubfolder.js');
    output('last').equals('root.js\nsubfolder.js\nroot.txt\nsubfolder.txt');
    output('multiple1').equals('root.js\nroot.txt');
    output('multiple2').equals('root.txt\nroot.js');
    output('alternate').equals('root.js\nroot.txt');
    output('alternateArray').equals('root.js\nsubfolder.js');
});
