function Path(path) {
    path = path ? normalise(path.toString()) : '';
    var filenameIndex = pathWithSlashes(path).lastIndexOf("/") + 1;
    var extensionIndex = path.lastIndexOf(".");

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
            return pathWithSlashes(path).charAt(0) === '/' ||
                path.substring(1, 3) == ':\\';
        },
        match: function(spec) {
            var regex = new RegExp('(' + spec
                .replace(/[\\\/]/g, '[\\\\\\\/]')
                .replace(/\*/g, '[^\\\\\\\/]*')
                .replace(/\?/g, '[^\\\\\\\/]?')
                .replace(/\./g, '\\.') + '$)');
            var result = regex.exec('\\' + path);
            return result && result[1];
        },
        toString: function() {
            return path.toString();
        }
    };
    
    function normalise(input) {
        input = removeDoubleSlashes(input);
        input = removeParentPaths(input);
        input = removeCurrentPaths(input);
        
        return input;
    }
    
    function removeDoubleSlashes(input) {
        return input.replace(/\/\//g, '/')
            .replace(/\\\\/g, '\\');
    }
    
    function removeParentPaths(input) {
        var regex = /[^\/\\\.]+[\/\\]\.\.[\/\\]/;

        while (input.match(regex))
            input = input.replace(regex, '');

        return input;
    }
    
    function removeCurrentPaths(input) {
        var regex = /\.[\/\\]/g;
        // ignore leading parent paths - the rest will have been stripped
        // i can't figure out a regex that won't strip the ./ out of ../
        var startIndex = pathWithSlashes(input).lastIndexOf('../');
        startIndex = startIndex == -1 ? 0 : startIndex + 3;
        return input.substring(0, startIndex) + input.substring(startIndex).replace(regex, '');
    }
    
    function pathWithSlashes(path) {
        return path.replace(/\\/g, '/');
    }
};