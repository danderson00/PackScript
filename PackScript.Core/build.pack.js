pack({
    to: 'Build/output.js',
    include: [
        'Libraries/*.js',
        'Container.js',
        'Pack.js',
        'TransformRepository.js',
        'Path.js',
        'utils.js',
        'FileList.js',
        'Output.js',
        'resources.js',
        'commands.js',
        'Api.js',
        { files: 'Transforms/*.js', prioritise: ['combine.js', 'sass.js'] },
        { files: 'Embedded/*.pack.config.js', recursive: true },
        { files: 'Embedded/*.template.*', template: 'Pack.embedTemplate', recursive: true }
    ],
    includeConfigs: true
});