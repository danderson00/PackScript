pack({
    to: '../TestOutput/nonrecursive',
    include: '*.*'
});

pack({
    to: '../TestOutput/recursive',
    include: '*.*',
    recursive: true
});

pack({
    to: '../TestOutput/individualIncludes',
    include: [
        { files: '*.js', recursive: true },
        { files: '*.txt', recursive: false }
    ]
});

pack({
    to: '../TestOutput/excludes',
    include: '*.*',
    exclude: '*.txt',
    recursive: true
});

pack({
    to: '../TestOutput/simplePrioritise',
    include: '*.*',
    prioritise: 'root.txt'
});

pack({
    to: '../TestOutput/prioritise',
    include: {
        files: '*.*',
        prioritise: ['root.txt', 'subfolder.txt'],
        recursive: true
    }
});

pack({
    to: '../TestOutput/last',
    include: {
        files: '*.*',
        last: ['root.txt', 'subfolder.txt'],
        recursive: true
    }
});