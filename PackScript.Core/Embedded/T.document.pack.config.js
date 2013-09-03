T = this.T || {};
T.document = function (objectName) {
    return {
        name: 'T.document',
        data: {
            documentation: function(content) {
                var documentation = T.document.extractDocumentation(content);
                var members = T.document.captureMembers(documentation);
                return objectName + ' = ' + JSON.stringify(members);
            }
        }
    };
};

T.document.captureMembers = function(documentation) {
    var context = T.document.captureContext();
    try {
        new Function(prepareScript(documentation)).call(context);
    } catch(e) {
        log.error("Error executing documentation comments - " + e.message);
    }
    return context.result;
};

function prepareScript(source) {
    // this makes the context functions available without the this. prefix
    return 'with(this){' + source + '}';
}

T.document.captureContext = function() {
    var result = {};
    var namespace = result;
    return {
        namespace: function(name) {
            namespace = T.document.findOrCreateNamespace(result, name);
        },
        func: function(details) {
            namespace.functions = namespace.functions || [];
            namespace.functions.push(details);
        },
        constructor: function(details) {
            namespace.constructor = details;
        },
        result: result
    };
};

T.document.findOrCreateNamespace = function(target, name) {
    var names = name.match(/[^\.]+/g);
    var currentTarget = target;
    for (var i = 0; i < names.length; i++) {
        currentTarget[names[i]] = currentTarget[names[i]] || {};
        currentTarget = currentTarget[names[i]];
    }
    return currentTarget;
};

T.document.extractDocumentation = function(content) {
    var regex = /^.*\/\/\/\/(.*)/gm;
    var match;
    var result = [];
    while (match = regex.exec(content))
        result.push(trim(match[1]));
    return result.join(' ');
};

function trim(source) {
    return source.replace(/^\s+|\s+$/g, '');
}