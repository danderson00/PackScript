T.scripts = function (folder, chrome, domain) {
    return {
        files: folder + '/*.js',
        recursive: true,
        template: chrome && [T.scriptUrl(domain), T.chrome()]
    };
};

T.scripts.chrome = function (folder, domain) {
    return T.scripts(folder, true, domain);
};