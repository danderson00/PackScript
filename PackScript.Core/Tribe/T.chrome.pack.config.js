T.chrome = function() {
    return {
        name: 'T.chrome'
    };
};

T.chromeScript = function(domain, protocol) {
    return [T.scriptUrl(domain, protocol), T.chrome()];
};

T.prepareForEval = function (content) {
    return content
        .replace(/\r/g, "")         // exclude windows linefeeds
        .replace(/\\/g, "\\\\")     // double escape
        .replace(/\n/g, "\\n")      // replace literal newlines with control characters
        .replace(/\"/g, "\\\"");    // escape double quotes
};