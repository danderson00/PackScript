sync({
    to: 'Target/Simple',
    include: '*.js'
});

sync({
    to: 'Target/Child',
    include: 'Child/*.js'
});

sync({
    to: 'Target/Recursive',
    include: '*.js',
    recursive: true
});

sync('*.js').to('Target/Alternate');