zip({
    to: '../TestOutput/Simple.zip',
    include: '*.js'
});

zip({
    to: '../TestOutput/Child.zip',
    include: 'Child/*.js'
});

zip({
    to: '../TestOutput/Recursive.zip',
    include: '*.js',
    recursive: true
});