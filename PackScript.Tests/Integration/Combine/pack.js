pack({
    to: 'nonrecursive',
    include: '*.*'
});

pack({
    to: 'recursive',
    include: '*.*',
    recursive: true
});

pack({
    to: 'individualIncludes',
    include: [
        { files: '*.js', recursive: true },
        { files: '*.txt', recursive: false }
    ]
});

pack({
    to: 'excludes',
    include: '*.*',
    exclude: '*.txt',
    recursive: true
});

pack({
    to: 'simplePrioritise',
    include: '*.*',
    prioritise: 'root.txt'
});

pack({
    to: 'prioritise',
    include: {
        files: '*.*',
        prioritise: ['root.txt', 'subfolder.txt'],
        recursive: true
    }
})