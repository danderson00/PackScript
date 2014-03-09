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

sync('test.js').to('../TestOutput/Sync/Alternate');

sync({ directory: 'Child' }).to('../TestOutput/Sync/Directory');
sync({ directory: ['Child', 'Child2'] }).to('../TestOutput/Sync/DirectoryArray');
