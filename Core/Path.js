Path = function(path) {
    path = path ? normalise(path.toString()) : '';
    var filenameIndex = path.lastIndexOf('/') + 1;
    var extensionIndex = path.lastIndexOf('.');

    return {
        withoutFilename: function() {
            return Path(path.substring(0, filenameIndex));
        },
        filename: function() {
            return Path(path.substring(filenameIndex));
        },
        extension: function() {
            return Path(extensionIndex === -1 ? '' : path.substring(extensionIndex + 1));
        },
        withoutExtension: function() {
            return Path(extensionIndex === -1 ? path : path.substring(0, extensionIndex));
        },
        isAbsolute: function() {
            return path.charAt(0) === '/' ||
                path.substring(1, 3) == ':/';
        },
        makeAbsolute: function () {
            return Path('/' + path);
        },
        makeRelative: function () {
            return Path(path[0] === '/' ? path.substring(1) : path);
        },
        match: function (spec) {
            var regex = new RegExp(baseMatchRegex(spec) + '$');
            var result = regex.exec('/' + path);
            return result && result[0];
        },
        matchFolder: function(spec) {
            var regex = new RegExp(baseMatchRegex(spec));
            var result = regex.exec('/' + path);
            return result && result[0];
        },
        asMarkupIdentifier: function() {
            return Path(this.withoutExtension().toString().replace(/\//g, '-').replace(/\./g, ''));
        },
        toString: function() {
            return path.toString();
        }
    };
    
    function normalise(input) {
        input = normaliseSlashes(input);
        input = removeDoubleSlashes(input);
        input = removeParentPaths(input);
        input = removeCurrentPaths(input);
        
        return input;
    }
    
    function normaliseSlashes(input) {
        return input.replace(/\\/g, '/');
    }

    function removeDoubleSlashes(input) {
        return input.replace(/\/\//g, '/');
    }
    
    function removeParentPaths(input) {
        var regex = /[^\/\.]+\/\.\.\//;

        while (input.match(regex))
            input = input.replace(regex, '');

        return input;
    }
    
    function removeCurrentPaths(input) {
        var regex = /\.\//g;
        // Ignore leading parent paths - the rest will have been stripped
        // I can't figure out a regex that won't strip the ./ out of ../
        var startIndex = input.lastIndexOf('../');
        startIndex = startIndex == -1 ? 0 : startIndex + 3;
        return input.substring(0, startIndex) + input.substring(startIndex).replace(regex, '');
    }
    
    function baseMatchRegex(spec) {
        return spec && spec.toString()
            .replace(/[\\\/]/g, '[\\\\\\\/]')
            .replace(/\*/g, '[^\\\\\\\/]*')
            .replace(/\?/g, '[^\\\\\\\/]?')
            .replace(/\./g, '\\.');
    }
};