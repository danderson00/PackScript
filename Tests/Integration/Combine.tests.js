integrationTest('Combine', function(output) {
    output('nonrecursive').equals('root.jsroot.txt');
    output('recursive').equals('root.jsroot.txtsubfolder.jssubfolder.txt');
    output('individualIncludes').equals('root.jssubfolder.jsroot.txt');
    output('subfolder').equals('subfolder.jssubfolder.txt');
    output('excludes').equals('root.jssubfolder.js');
    output('simplePrioritise').equals('root.txtroot.js');
    output('prioritise').equals('root.txtsubfolder.txtroot.jssubfolder.js');
    output('last').equals('root.jssubfolder.jsroot.txtsubfolder.txt');
    output('multiple1').equals('root.jsroot.txt');
    output('multiple2').equals('root.txtroot.js');
    output('alternate').equals('root.jsroot.txt');
    output('alternateArray').equals('root.jssubfolder.js');
});
