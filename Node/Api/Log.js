Pack.api.Log = (function () {
    require('colors');
    
    var level = 4;
    var levels = {
        debug: 4,
        info: 3,
        warn: 2,
        error: 1,
        none: 0
    };
    
    return {
        setLevel: function (newLevel) {
            level = levels[newLevel];
            if (level === undefined) level = 4;
        },
        debug: function (message) {
            if (level >= 4) 
                console.log(('DEBUG: ' + message).grey);
        },
        info: function(message) {
            if (level >= 3)
                console.info(('INFO: ' + message).white);
        },
        warn: function(message) {
            if (level >= 2)
                console.warn(('WARN: ' + message).yellow);
        },
        error: function(message, error) {
            if (level >= 1)
                console.error(('ERROR: ' + message).red, error);
        }
    };
})();
