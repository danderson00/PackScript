T.scripts = function (folder) {
    return {
        files: folder + '/*.js',
        recursive: true
    };
};

T.scripts.chrome = function (folder, domain) {
    return {
        files: folder + '/*.js',
        recursive: true,
        template: [T.scriptUrl(domain), T.chrome()]
    };
};