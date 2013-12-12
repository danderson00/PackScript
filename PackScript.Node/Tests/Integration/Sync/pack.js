sync({
    to: '../TestOutput/Sync/Simple',
    include: '*.js'
});

sync({
    to: '../TestOutput/Sync/Child',
    include: 'Child/*.js'
});

sync({
    to: '../TestOutput/Sync/Recursive',
    include: '*.js',
    recursive: true
});

sync('*.js').to('../TestOutput/Sync/Alternate');