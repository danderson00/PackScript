Pack.Watcher = function (pack, path) {
    var watchr = require('watchr');
    watchr.watch({
        paths: [path || '.'],
        listeners: {
            change: function(changeType, filePath) {
                pack.fileChanged(filePath, changeType);
            },
            error: function (error) {
                Pack.api.Log.error(error, 'Error watching ' + path);
            }
        }
    });
};