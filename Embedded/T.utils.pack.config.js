T.sourceUrlTag = function (path, domain, protocol) {
    if (path.toString().indexOf('://') === -1) {
        var fullPath = Path((domain || '') + '/' + path).makeRelative().toString();
        path = (protocol || 'tribe') + '://' + fullPath;
    }

    return ('\\n//@ sourceURL=' + path.replace(/\\/g, '/'));
};

T.modelScriptEnvironment = function (resourcePath, prefix) {
    return "T.scriptEnvironment = { resourcePath: '" + Path((prefix || '') + '/' + resourcePath).withoutExtension().makeAbsolute() + "' };";
};

T.templateIdentifier = function(resourcePath, prefix) {
    return 'template-' + Path((prefix || '') + '/' + resourcePath).withoutExtension().makeAbsolute().asMarkupIdentifier();
};

T.embedString = function (source) {
    return source
        .replace(/\\/g, "\\\\")
        .replace(/\r/g, "")
        .replace(/\n/g, "\\n")
        .replace(/\'/g, "\\'");
};

T.prepareForEval = function (content) {
    return content
        .replace(/\r/g, "")         // exclude windows linefeeds
        .replace(/\\/g, "\\\\")     // double escape
        .replace(/\n/g, "\\n")      // replace literal newlines with control characters
        .replace(/\"/g, "\\\"");    // escape double quotes
};