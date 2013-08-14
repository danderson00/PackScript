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
        'setup.js',
        { files: 'Transforms/*.js', prioritise: ['combine.js', 'sass.js'] },
        'Tribe/*.pack.config.js',
        { files: 'Tribe/*.template.*', template: 'Pack.embedTemplate' }
    ],
    includeConfigs: true
});