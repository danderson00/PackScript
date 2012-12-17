pack({
    to: 'output',
    include: '1.js'
});

pack({
    to: 'final',
    include: ['output', '2.js']
});
