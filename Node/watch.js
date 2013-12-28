Pack.prototype.watch = function (path) {
    var self = this;
    var watchr = require('watchr');
    watchr.watch({
        paths: [path || '.'],
        listeners: {
            change: function(changeType, filePath) {
                self.fileChanged(Path(filePath).toString(), changeType);
            },
            error: function (error) {
                Pack.api.Log.error(error, 'Error watching ' + path);
            }
        }
    });
    return this;
};