T.panes = function (folder, prefix, domain) {
    return [
        { files: folder + '/*.css', recursive: true, template: 'embedCss' },
        { files: folder + '/*.htm', recursive: true, template: { name: 'embedTemplate', data: { prefix: prefix } } },
        { files: folder + '/*.js', recursive: true, template: { name: 'T.model', data: { domain: domain, prefix: prefix } } }
    ];
};

T.panes.chrome = function(folder, prefix, domain) {
    return [
        { files: folder + '/*.css', recursive: true, template: ['embedCss', 'T.chrome'] },
        { files: folder + '/*.htm', recursive: true, template: [{ name: 'embedTemplate', data: { prefix: prefix } }, 'T.chrome'] },
        { files: folder + '/*.js', recursive: true, template: [{ name: 'T.model', data: { domain: domain, prefix: prefix } }, 'T.chrome'] }
    ];
};