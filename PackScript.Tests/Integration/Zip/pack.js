zip({
    to: 'Simple.zip',
    include: '*.js'
});

zip({
    to: 'Child.zip',
    include: 'Child/*.js'
});

zip({
    to: 'Recursive.zip',
    include: '*.js',
    recursive: true
});