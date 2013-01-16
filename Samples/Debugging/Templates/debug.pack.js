this.prepareContent = function (content, path) {
    return content
        .replace(/\r/g, "")                 // exclude windows linefeeds
        .replace(/\\/g, "\\\\")             // double escape
        .replace(/\n/g, "\\n")              // replace literal newlines with control characters
        .replace(/\"/g, "\\\"")             // escape double quotes
        + "\\n\/\/@ sourceURL="             // append sourceURL tag
        + path.toString().replace(/\\/g, '/');
} 
