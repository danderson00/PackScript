pack({
    to: 'output',
    include: '../3.js'
});

pack({
    to: '../TestOutput/subfolder',
    include: ['output', '../4.js']
});
