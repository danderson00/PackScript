pack({
    to: '../TestOutput/builtinData',
    include: '*.txt',
    recursive: true,
    template: 'builtinData'
});

pack({
    to: '../TestOutput/passedData',
    include: 'root.txt',
    template: { name: 'passedData', data: { string: 'test', integer: 2 } }
});

pack({
    to: '../TestOutput/separateTemplates',
    include: [
        { files: 'root.txt' },
        { files: 'Subfolder/subfolder.txt', template: 'template2' }
    ],
    template: 'template1'
});

pack({
    to: '../TestOutput/pathRelativeToInclude',
    include: { files: 'Subfolder/*.*', recursive: true, template: 'template3' }
})