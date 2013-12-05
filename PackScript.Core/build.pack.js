var includes = [
    'Container.js',
    'Pack.js',
    'TransformRepository.js',
    'Path.js',
    'utils.js',
    'FileList.js',
    'Output.js',
    'resources.js',
    'commands.js',
    'changeHandlers.js',
    'Api.js',
    { files: 'Transforms/*.js', prioritise: ['combine.js', 'sass.js'] },
    { files: 'Embedded/*.pack.config.js', recursive: true },
    { files: 'Embedded/*.template.*', template: 'Pack.embedTemplate', recursive: true }
];

pack({
    to: 'Build/packscript.core.js',
    include: ['Libraries/*.js', includes],
    includeConfigs: true
});

pack({
    to: 'Build/packscript.core.node.js',
    include: ['setup.node.js', includes],
    includeConfigs: true
});