pack({
    to: 'output',
    include: '1.js'
});

pack({
    to: '../TestOutput/final',
    include: ['output', '2.js']
});
