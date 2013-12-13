var _ = require('underscore');
Pack.Container = function() {
    this.files = new FileList();
    this.output = '';
};function Pack(options) {
    this.outputs = [];
    this.templates = _.extend({}, Pack.templates);
    this.loadedConfigs = [];
    this.transforms = new Pack.TransformRepository(Pack.transforms);
    
    this.options = _.extend({
        configurationFileFilter: '*pack.config.js',
        packFileFilter: '*pack.js',
        templateFileExtension: '.template.*',
        logLevel: 'debug',
        throttleTimeout: 200
    }, options);
}

Pack.api = {};
Pack.templates = {};
Pack.transforms = {};

Pack.prototype.setOptions = function(options) {
    _.extend(this.options, options);
    Pack.api.Log.setLevel(this.options.logLevel);
    return this;
};

Pack.prototype.matchingOutputs = function (paths, refresh) {
    var self = this;
    var outputs = this.outputs;
    return _.union.apply(_, Pack.utils.executeSingleOrArray(paths, matchSingle));

    function matchSingle(item) {
        return _.filter(outputs, function (output) {
            return output.constructor === Pack.Output && output.matches(item, self.transforms, refresh);
        });
    }
};

Pack.prototype.removeConfigOutputs = function (path) {
    var outputs = this.outputs;
    _.each(outputs.slice(0), function(output) {
        if (output.configPath === path)
            outputs.splice(outputs.indexOf(output), 1);
    });
};

Pack.prototype.configOutputs = function(path) {
    return _.filter(this.outputs, function (output) {
        return output.configPath === path;
    });
};

Pack.prototype.addOutput = function (transforms, configPath) {
    var self = this;
    return Pack.utils.executeSingleOrArray(transforms, addSingleOutput);

    function addSingleOutput(transform) {
        if (transform) {
            var output = new Pack.Output(transform, configPath);
            self.outputs.push(output);
        }
        return output;
    }    
};

Pack.prototype.removeOutput = function(output) {
    this.outputs.splice(this.outputs.indexOf(output), 1);
};Pack.TransformRepository = function (transforms) {
    var self = this;

    _.extend(this, transforms);

    this.events = ['includeFiles', 'excludeFiles', 'content', 'output', 'finalise'];
    this.defaultTransforms = { excludeDefaults: true, load: true, combine: true, template: true };
    
    this.add = function (name, event, func) {
        self[name] = { event: event, apply: func };
    };

    this.applyTo = function (output, options) {
        return self.applyEventsTo(self.events, output, options);
    };

    this.applyEventsTo = function(events, output, options) {
        var target = new Pack.Container();
        var transforms = _.extend({}, self.defaultTransforms, output.transforms);
        _.each(events, function(event) {
            _.each(transforms, function(value, name) {
                if (self[name] && self[name].event === event)
                    self[name].apply({ value: value, output: output, target: target, options: options || {} });
            });
        });
        return target;
    };
};function Path(path) {
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
        makeAbsolute: function () {
            return Path('/' + path);
        },
        makeRelative: function () {
            return Path((path[0] === '/' || path[0] === '\\') ? path.substring(1) : path);
        },
        match: function (spec) {
            var regex = new RegExp(baseMatchRegex(spec) + '$');
            var result = regex.exec('\\' + path);
            return result && result[0];
        },
        matchFolder: function(spec) {
            var regex = new RegExp(baseMatchRegex(spec));
            var result = regex.exec('\\' + path);
            return result && result[0];
        },
        asMarkupIdentifier: function() {
            return Path(this.withoutExtension().toString().replace(/[\\\/]/g, '-').replace(/\./g, ''));
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
    
    // These cater for both forward and back slashes. 
    // Implemented before I changed normalise to change them all to forward slashes
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
        // Ignore leading parent paths - the rest will have been stripped
        // I can't figure out a regex that won't strip the ./ out of ../
        var startIndex = pathWithSlashes(input).lastIndexOf('../');
        startIndex = startIndex == -1 ? 0 : startIndex + 3;
        return input.substring(0, startIndex) + input.substring(startIndex).replace(regex, '');
    }
    
    function pathWithSlashes(path) {
        return path.replace(/\\/g, '/');
    }
    
    function baseMatchRegex(spec) {
        return spec && spec.toString()
            .replace(/[\\\/]/g, '[\\\\\\\/]')
            .replace(/\*/g, '[^\\\\\\\/]*')
            .replace(/\?/g, '[^\\\\\\\/]?')
            .replace(/\./g, '\\.');
    }
};Pack.utils = {};

Pack.utils.eval = function (source) {
    try {
        (function () { eval.apply(this, arguments); }('(function(){' + source + '})();'));
    } catch (exception) {
        Pack.utils.logError(exception);
    }
};

Pack.utils.logError = function (error, message) {
    var customMessage = message ? message + '\n' : '';
    var errorMessage = error instanceof Error ? error.name + ': ' + error.message : error;
    Pack.api.Log.error(customMessage + errorMessage);
};

Pack.utils.executeSingleOrArray = function (value, func, reverse) {
    if (_.isArguments(value))
        value = _.toArray(value);
    
    if (_.isArray(value)) {
        var array = _.flatten(value);
        return _.map(reverse ? array.reverse() : array, function (individualValue) {
            // we can't shortcut this or may introduce unintended arguments from the _.map function
            return func(individualValue);
        });
    } else
        return func(value);
};

Pack.utils.invokeSingleOrArray = function (value, method) {
    return Pack.utils.executeSingleOrArray(value, function(target) {
        return target[method]();
    });
};

Pack.prototype.outputsFor = function(path) {
    return _.filter(this.outputs, function(output) {
        return output.transforms.to && Path(output.transforms.to).match(path);
    });
};function FileList() {
    var self = this;
    
    this.list = [];
    var hashed = {};

    function add(file) {
        file = mapToFileObject(file);
        if(!hashed[file.path])
        {
            self.list.push(file);
            hashed[file.path] = file;
        }
    }
    
    function remove(file) {
        file = mapToFileObject(file);
        if (hashed[file.path]) {
            self.list = _(self.list).without(hashed[file.path]);
            delete hashed[file.path];
        }
    }
    
    function mapToFileObject(file) {
        if (file.constructor === String)
            return { path: file };
        return file;
    }

    this.include = function (files) {
        if(files)
            Pack.utils.executeSingleOrArray(unwrapFileList(files), add);
        return this;
    };

    this.exclude = function(files) {
        if (files)
            Pack.utils.executeSingleOrArray(unwrapFileList(files), remove);
        return this;
    };

    this.filter = function(func, exclude) {
        _.each(self.paths(), function (path) {
            if (func(path, hashed[path]) ? exclude : !exclude)
                remove(path);
        });
        return this;
    };

    this.setProperty = function(property, values) {
        _.each(values, function(value, path) {
            hashed[path][property] = value;
        });
    };

    this.prioritise = function (filename, last) {
        // ouch... there has to be a better way to do this!
        var indexes = _.chain(self.list)
            .map(function (file, index) {
                return Path(file.path).filename().toString() === filename ? index : false;
            })
            .filter(function(index) {
                return index !== false;
            })
            .value();
        var items = _.map(indexes, function(index) {
            return self.list[index];
        });
        _.each(indexes, function(index) {
            self.list.splice(index, 1);
        });
        self.list = last ?
            self.list.concat(items) :
            items.concat(self.list);
        return self;
    };
    
    this.paths = function() {
        return _(hashed).keys();
    };

    this.isEmpty = function() {
        return self.list.length === 0;
    };

    function unwrapFileList(source) {
        return source.constructor === FileList ? source.list : source;
    }

    if (arguments.length > 0)
        self.include(_.toArray(arguments));
}Pack.Output = function (transforms, configPath) {
    this.configPath = configPath;
    this.basePath = Path(configPath).withoutFilename().toString();
    this.outputPath = Path(this.basePath + (transforms && transforms.to)).toString();
    this.transforms = transforms || {};
};

Pack.Output.prototype.matches = function (path, transformRepository, refresh) {
    // we save the list of file paths so we don't need to hit the filesystem for each check
    // this gets set by finalise transforms to, zipTo and syncTo
    if(refresh || !this.currentPaths)
        this.currentPaths = transformRepository.applyEventsTo(['includeFiles', 'excludeFiles'], this, { log: false }).files.paths();
    
    return _.any(this.currentPaths, function(filePath) {
        return Path(path).match(filePath);
    });
};

Pack.Output.prototype.build = function(transformRepository) {
    return transformRepository.applyTo(this);
};

Pack.Output.prototype.targetPath = function () {
    return this.transforms.to ||
        this.transforms.zipTo ||
        this.transforms.syncTo;
};(function () {
    Pack.prototype.scanForResources = function (path) {
        this.scanForConfigs(path);
        this.scanForTemplates(path);
        return this;
    };

    Pack.prototype.scanForConfigs = function (path) {
        var Files = Pack.api.Files;
        var allConfigs = _.union(
            Files.getFilenames(path + this.options.configurationFileFilter, true),
            Files.getFilenames(path + this.options.packFileFilter, true));
        this.loadedConfigs = allConfigs;
        var configs = Files.getFileContents(this.loadedConfigs);
        for (var configPath in configs)
            this.loadConfig(configPath, configs[configPath]);
        return this;
    };

    Pack.prototype.loadConfig = function (path, source) {
        Pack.api.Log.info("Loading config from " + path);
        Context.configPath = path;
        Pack.utils.eval(source);
        delete Context.configPath;
        return this;
    };

    Pack.prototype.scanForTemplates = function (path) {
        Pack.api.Log.info("Loading templates from " + path);
        var files = Pack.api.Files.getFilenames(path + '*' + this.options.templateFileExtension, true);
        for (var index in files)
            this.loadTemplate(files[index]);
        return this;
    };

    Pack.prototype.loadTemplate = function(path) {
        Pack.api.Log.debug("Loaded template " + templateName(path, this.options.templateFileExtension));
        var loadedTemplates = Pack.api.Files.getFileContents([path]);
        this.storeTemplate(path, loadedTemplates[path]);
        return this;
    };

    Pack.prototype.storeTemplate = function(path, template) {
        this.templates[templateName(path, this.options.templateFileExtension)] = template;
        return this;
    };

    function templateName(path, fileExtension) {
        var replaceRegex = new RegExp(Path(path).match(fileExtension) + '$');
        return Path(path).filename().toString().replace(replaceRegex, '');
    }

})();
(function() {
    Pack.prototype.all = function() {
        this.build(this.outputs);
        return this;
    };

    Pack.prototype.build = function (outputs) {
        var self = this;

        if (!this.options.throttle)
            this.buildSync(outputs);
        else {
            var timeout = this.options.throttleTimeout;
            this.buildQueue = _.union(this.buildQueue, outputs);

            if (this.buildTimeout)
                clearTimeout(this.buildTimeout);
            
            this.buildTimeout = setTimeout(function() {
                self.buildSync(this.buildQueue);
                this.buildQueue = [];
                this.buildTimeout = undefined;
            }, timeout);
        }
        return this;
    };

    Pack.prototype.buildSync = function (outputs) {
        var self = this;

        Pack.utils.executeSingleOrArray(outputs, buildOutput);

        var outputPaths = _.isArray(outputs) ? _.pluck(outputs, 'outputPath') : outputs.outputPath;
        var matchingOutputs = this.matchingOutputs(outputPaths);
        if (matchingOutputs.length > 0)
            this.build(matchingOutputs);
        return this;

        function buildOutput(output) {
            return output.build(self.transforms);
        }
    };

    Pack.prototype.executeTransform = function(name, output) {
        if (this.transforms[name])
            return this.transforms[name].apply(output.transforms[name], output);
    };    
})();
Pack.prototype.fileChanged = function (path, oldPath, changeType) {
    if (Path(path).match(this.options.configurationFileFilter) || Path(path).match(this.options.packFileFilter))
        this.handleConfigChange(path, oldPath, changeType);
    else if (Path(path).match('*' + this.options.templateFileExtension))
        this.handleTemplateChange(path, oldPath, changeType);
    else
        this.handleFileChange(path, oldPath, changeType);
};

Pack.prototype.handleFileChange = function (path, oldPath, changeType) {
    var refresh = changeType === 'add';
    var pathToTest = changeType === 'rename' ? oldPath : path;
    this.build(this.matchingOutputs(pathToTest, refresh));
};

Pack.prototype.handleConfigChange = function (path, oldPath, changeType) {
    this.removeConfigOutputs(oldPath);
    if (changeType !== 'delete') {
        this.loadConfig(path, Pack.api.Files.getFileContents([path])[path]);
        this.build(this.configOutputs(path));
    }
};

Pack.prototype.handleTemplateChange = function (path, oldPath, changeType) {
    if (changeType !== 'delete')
        this.loadTemplate(path);
};Pack.Api = function (packOptions) {
    var self = this;
    
    this.pack = function (options) {
        options = unwrapOptions(options, arguments);
        return addOutputs(options, 'to');
    };

    this.sync = function(options) {
        options = unwrapOptions(options, arguments);
        renameProperties(options, 'to', 'syncTo');
        return addOutputs(options, 'syncTo');
    };

    this.zip = function(options) {
        options = unwrapOptions(options, arguments);
        renameProperties(options, 'to', 'zipTo');
        return addOutputs(options, 'zipTo');
    };

    function addOutputs(options, transformName) {
        var outputs = self.pack.addOutput(options, Context.configPath);

        if (outputs.length === 1)
            return createWrapper(outputs[0]);

        return _.map(outputs, createWrapper);

        function createWrapper(output) {
            return {
                output: output,
                to: function (targets) {
                    self.pack.removeOutput(output);
                    _.each(unwrapTargets(targets), addMergedTransforms);
                }
            };
            
            function unwrapTargets(targets) {
                if (targets.constructor === String) {
                    var unwrapped = {};
                    unwrapped[targets] = {};
                    return unwrapped;
                }
                return targets;
            }

            function addMergedTransforms(targetTransforms, path) {
                var transforms = _.extend({}, output.transforms, targetTransforms);
                transforms[transformName] = path;
                self.pack.addOutput(transforms, output.configPath);
            }            
        }
    }
    
    function unwrapOptions(options, args) {
        // If we're passed a string or an array, assume we want this to be the include option
        if (options.constructor === String || _.isArray(options))
            return [{ include: options }];
        return _.toArray(args);
    }
    
    function renameProperties(array, from, to) {
        _.each(array, function(target) {
            target[to] = target[from];
            delete target[from];
        });
    }

    // extend the pack member of the api object with a new instance of a Pack object
    _.extend(self.pack, new Pack(packOptions));
};
// the assumption here is that the built file will be run as a node module and this variable won't be exposed globally
// the embedded stuff depends on this. probably should change how it works...
var instance = new Pack.Api();
    
if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports)
        exports = module.exports = instance;
} //else
    // this is necessary for the Windows console version that runs on Noesis.Javascript
    _.extend(this, instance);
Pack.transforms.combine = {
    event: 'output',
    apply: function(data) {
        var target = data.target;
        var output = data.output;

        log();
        target.output = _.pluck(target.files.list, 'content').join('');

        function log() {
            Pack.api.Log.debug('(' + filenames() + ') -> ' + (output.transforms && output.transforms.to));
            if (target.files.list.length === 0)
                Pack.api.Log.warn('No files to include for ' + (output.transforms && output.transforms.to));
        }

        function filenames() {
            return _.map(target.files.paths(), function(path) {
                return Path(path).filename();
            }).join(', ');
        }
    }
};

Pack.transforms.sass = {
    event: 'output',
    apply: function(data) {
        var target = data.target;
        var output = data.output;
        var Log = Pack.api.Log;

        if (typeof Sass === 'undefined') {
            Log.warn("SASS compilation requested but no API provided");
            return;
        }

        Log.debug('Applying SASS compiler to ' + (output.transforms && output.transforms.to));
        var compiled = Sass.apply(target.output);
        if (compiled)
            target.output = compiled;
    }
};

(function () {
    var utils = Pack.utils;
    var transforms = Pack.transforms;
    
    transforms.prioritise = { event: 'includeFiles', apply: first };
    transforms.first = { event: 'includeFiles', apply: first };
    transforms.last = { event: 'includeFiles', apply: last };
    
    function first(data) {
        utils.executeSingleOrArray(data.value, data.target.files.prioritise);
    }
    
    function last(data) {
        utils.executeSingleOrArray(data.value, function (value) {
            data.target.files.prioritise(value, true);
        });
    }

    transforms.excludeDefaults = {
        event: 'excludeFiles',
        apply: function(data) {
            data.target.files.exclude(data.output.outputPath);
            if (!data.output.transforms.includeConfigs)
                data.target.files.exclude(pack.loadedConfigs);

        }
    };
})();

(function () {
    var utils = Pack.utils;
    var transforms = Pack.transforms;

    transforms.include = {
        event: 'includeFiles',
        apply: function(data) {
            Pack.api.Log.debug('Including ' + formatInclude(data.value, data.output) + ' in ' + data.output.targetPath());
            data.target.files.include(loadFileList(data.value, data.output));
        }
    };
    
    transforms.exclude = {
        event: 'excludeFiles',
        apply: function(data) {
            Pack.api.Log.debug('Excluding ' + formatInclude(data.value, data.output) + ' from ' + data.output.targetPath());
            data.target.files.exclude(loadFileList(data.value, data.output));
        }
    };

    function loadFileList(allValues, output) {
        var Files = Pack.api.Files;
        var allFiles = new FileList();
        utils.executeSingleOrArray(allValues, includeValue);
        return allFiles;

        function includeValue(value) {
            allFiles.include(loadIndividualFileList(value));
        }

        function loadIndividualFileList(value) {
            var files = new FileList();

            if (_.isFunction(value))
                value = value(output);
            if (!value)
                value = '*.*';
            if (value.constructor === String)
                files.include(getFiles(value));
            else if (_.isObject(value))
                files.include(getFiles(value.files || '*.*'));

            prioritise();

            return files;

            function getFiles(filespec) {
                return _.map(getFileNames(filespec), function (file) {
                    var includePath = Path(output.basePath + filespec).withoutFilename();
                    var path = Path(file);
                    return {
                        path: path,
                        template: value.template,
                        filespec: filespec,
                        configPath: Path(output.basePath),
                        pathRelativeToConfig: Path(file.replace(path.matchFolder(output.basePath), '').replace(/\\/g, '/')),
                        includePath: includePath,
                        pathRelativeToInclude: Path(file.replace(path.matchFolder(includePath), '').replace(/\\/g, '/')),
                    };
                });
            }

            function getFileNames(filespec) {
                return Files.getFilenames(output.basePath + filespec, recurse());
            }
            
            function prioritise() {
                if (value.prioritise)
                    utils.executeSingleOrArray(value.prioritise, files.prioritise, true);
                
                if (value.first)
                    utils.executeSingleOrArray(value.first, files.prioritise, true);

                if (value.last)
                    utils.executeSingleOrArray(value.last, function(individualFile) {
                        files.prioritise(individualFile, true);
                    });
            }

            function recurse() {
                return value.recursive === true || (output.transforms.recursive === true && value.recursive !== false);
            }
        }
    }

    function formatInclude(include, output) {
        if(_.isFunction(include))
            include = include(output);        
        include = include || {};
        
        if (include.constructor === String)
            return include;
        if (include.files)
            return include.files;
        if (include.constructor === Array)
            return _.map(include, function(include) {
                return formatInclude(include, output);
            }).join(', ');
        return include.toString();
    }
})();

Pack.transforms.json = {
    event: 'output',
    apply: function(data) {
        data.target.output = JSON.stringify(data.value);
    }
};Pack.transforms.load = {
    event: 'content',
    apply: function(data) {
        var target = data.target;
        var output = data.output;
        var Files = Pack.api.Files;
        var Log = Pack.api.Log;

        var fileContents = Files.getFileContents(target.files.paths());

        target.files.setProperty('content', fileContents);

        var fileCount = target.files && _.keys(target.files.list).length;
        Log.debug(fileCount ?
            'Loaded content for ' + fileCount + ' files for ' + (output.transforms && output.transforms.to) :
            'No content to load for ' + (output.transforms && output.transforms.to));
    }
};

Pack.transforms.minify = {
    event: 'output',
    apply: function(data) {
        var output = data.output;
        var target = data.target;
        var Log = Pack.api.Log;
        var api = Pack.api;

        if (data.value) {
            Log.debug('Minifying ' + output.transforms.to);
            switch (Path(output.transforms.to).extension().toString()) {
            case 'js':
                minify(api.MinifyJavascript);
                break;
            case 'htm':
            case 'html':
                minify(api.MinifyMarkup);
                break;
            case 'css':
                minify(api.MinifyStylesheet);
                break;
            default:
                Log.warn('Minification requested but not supported for ' + output.transforms.to);
            }
        }

        function minify(api) {
            if (api)
                target.output = api.minify(target.output);
            else
                Log.warn("Minification was requested but no appropriate API was provided for " + output.transforms.to);
        }
    }
};
Pack.transforms.outputTemplate = {
    event: 'output',
    apply: function(data) {
        var value = data.value;
        var target = data.target;
        var output = data.output;
        var Log = Pack.api.Log;

        Pack.utils.executeSingleOrArray(value, function(templateSettings) {
            normaliseTemplateSettings();

            var template = pack.templates[templateSettings.name];
            if (template) {
                Log.debug('Applying output template ' + templateSettings.name + ' to ' + output.transforms.to);

                var templateData = {
                    content: target.output,
                    configPath: Path(output.configPath),
                    data: value.data || {},
                    output: output,
                    target: target,
                    api: Pack.api
                };

                try {
                    target.output = _.template(template, templateData);
                } catch(ex) {
                    Pack.utils.logError(ex, "An error occurred applying template " + templateSettings.name);
                }
            }

            function normaliseTemplateSettings() {
                if (templateSettings.constructor === String)
                    templateSettings = { name: templateSettings };
            }
        });
    }
};

Pack.transforms.syncTo = {
    event: 'finalise',
    apply: function(data) {
        var Files = Pack.api.Files;
        var Log = Pack.api.Log;

        var targetFolder = Path(data.output.basePath + data.value + '/');
        var files = data.target.files.list;

        _.each(files, function(file) {
            Files.copyFile(file.path.toString(), targetFolder + file.pathRelativeToInclude);
        });

        Log.info('Copied ' + files.length + ' files to ' + targetFolder);

        // this should be moved to a separate transform. It is consumed by Output.matches
        data.output.currentPaths = data.target.files && data.target.files.paths();
    }
};

Pack.transforms.template = {
    event: 'content',
    apply: function(data) {
        var value = data.value;
        var output = data.output;
        var target = data.target;
        var Log = Pack.api.Log;

        _.each(target.files.list, applyTemplates);

        function applyTemplates(file) {
            var templateConfiguration = file.template || value;
            if (_.isFunction(templateConfiguration))
                templateConfiguration = templateConfiguration(data.output, data.target);

            Pack.utils.executeSingleOrArray(templateConfiguration, function(templateSettings) {
                normaliseTemplateSettings();

                var template = pack.templates[templateSettings.name];
                if (template) {
                    Log.debug('Applying template ' + templateSettings.name + ' to ' + Path(file.path).filename());
                    var templateData = {
                        content: file.content,
                        path: Path(file.path),
                        configPath: file.configPath,
                        pathRelativeToConfig: file.pathRelativeToConfig,
                        includePath: file.includePath,
                        pathRelativeToInclude: file.pathRelativeToInclude,
                        data: templateSettings.data || {},
                        output: output,
                        target: target,
                        api: Pack.api
                    };

                    try {
                        file.content = _.template(template, templateData);
                    } catch(ex) {
                        Pack.utils.logError(ex, "An error occurred applying template " + templateSettings.name);
                    }
                } else if (templateSettings.name) {
                    Log.warn("Unable to find template '" + templateSettings.name + "'.");
                }

                function normaliseTemplateSettings() {
                    if (templateSettings.constructor === String)
                        templateSettings = { name: templateSettings };
                }
            });
        }
    }
};Pack.transforms.to = {
    event: 'finalise',
    apply: function(data) {
        var Files = Pack.api.Files;
        var Log = Pack.api.Log;
        var path = Path(data.output.basePath + data.output.transforms.to);
        Files.writeFile(path.toString(), data.target.output);
        Log.info('Wrote file ' + path);

        // this should be moved to a separate transform - consumed by Output.matches
        data.output.currentPaths = data.target.files && data.target.files.paths();
    }
};

Pack.transforms.xdt = {
    event: 'output',
    apply: function(data) {
        var target = data.target;
        var output = data.output;
        var Log = Pack.api.Log;

        if (typeof Xdt === 'undefined') {
            Log.error("XDT transform requested but no API provided");
            return;
        }

        Log.debug('Applying XDT transforms to ' + (output.transforms && output.transforms.to));

        _.each(data.value, function(template) {
            target.output = Xdt.transform(target.output, pack.templates[template]);
        });
    }
};

Pack.transforms.zipTo = {
    event: 'finalise',
    apply: function(data) {
        var path = Path(data.output.basePath + data.value).toString();
        var Zip = Pack.api.Zip;
        var Log = Pack.api.Log;

        var files = {};
        _.each(data.target.files.list, function(file) {
            files[file.pathRelativeToInclude.toString()] = file.path.toString();
        });

        Zip.archive(path, files);
        Log.info('Wrote file ' + path);

        // this should be moved to a separate transform - consumed by Output.matches
        data.output.currentPaths = data.target.files && data.target.files.paths();
    }
};

T = { Panes: {} };
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
}T.mockjax = function (to, path) {
    var panes = {};
    
    var template = {
        name: 'T.mockjax',
        data: {
            registerUrl: registerUrl
        }
    };

    var outputTemplate = {
        name: 'T.mockjax.outer',
        data: {
            mockGaps: mockGaps
        }
    };

    return {
        to: to,
        include: path + '/*.*',
        recursive: true,
        template: template,
        outputTemplate: outputTemplate
    };


    function registerUrl(url) {
        var pane = Path(url).withoutExtension().toString();
        panes[pane] = panes[pane] || {};
        panes[pane][Path(url).extension().toString()] = true;
    }
    
    function mockGaps() {        
        return _.reduce(panes, function (output, extensions, pane) {
            var mocks = '';
            if (!extensions.js) mocks += mock404(pane + '.js');
            if (!extensions.htm) mocks += mock404(pane + '.htm');
            if (!extensions.css) mocks += mock404(pane + '.css');
            return output + mocks;
        }, '');
    }
    
    function mock404(url) {
        return "$.mockjax({ url: '" + url + "', status: 404, responseTime: 0 });\n";
    }
};T.sourceUrlTag = function (path, domain, protocol) {
    if (path.toString().indexOf('://') === -1) {
        var fullPath = Path((domain || '') + '/' + path).makeRelative().toString();
        path = (protocol || 'tribe') + '://' + fullPath;
    }

    return ('\\n//@ sourceURL=' + path.replace(/\\/g, '/'));
};

T.modelScriptEnvironment = function (resourcePath, prefix) {
    return "TC.scriptEnvironment = { resourcePath: '" + Path((prefix || '') + '/' + resourcePath).withoutExtension().makeAbsolute() + "' };";
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
};T.webTargets = function(path) {
    var targets = {};
    targets[path + '.js'] = {};
    targets[path + '.min.js'] = { minify: true };
    targets[path + '.debug.js'] = { debug: true };
    return targets;
};

T.webDependency = function(path) {
    return function(output) {
        if (output.transforms.minify)
            return path + '.min.js';
        if (output.transforms.debug)
            return path + '.debug.js';
        return path + '.js';
    };
};T.scripts = function (pathOrOptions, debug) {
    var options = normaliseOptions(pathOrOptions, debug);
    return include(function(output) {
        return {
            name: (options.debug || output.transforms.debug) ? 'T.Script.debug' : 'T.Script',
            data: options
        };
    }, 'js', options);
};

T.models = function(pathOrOptions, debug) {
    var options = normaliseOptions(pathOrOptions, debug);
    var template = function(output) {
        return [
            { name: 'T.Model', data: options },
            { name: (options.debug || output.transforms.debug) ? 'T.Script.debug' : 'T.Script', data: options }
        ];
    };
    return include(template, 'js', options);
};

T.templates = function(pathOrOptions, debug) {
    var options = normaliseOptions(pathOrOptions, debug);
    return include('T.Template', 'htm', options);
};

T.styles = function(pathOrOptions, debug) {
    var options = normaliseOptions(pathOrOptions, debug);
    return include('T.Style', 'css', options);
};

T.panes = function (pathOrOptions, debug) {
    return [
        T.models(pathOrOptions, debug),
        T.templates(pathOrOptions, debug),
        T.styles(pathOrOptions, debug)
    ];
};

function include(template, extension, data) {
    if (template.constructor === String)
        template = { name: template, data: data };

    var path = data.path;
    if (Path(data.path).extension().toString() !== extension)
        path += '/*.' + extension;
    
    return {
        files: path,
        recursive: data.recursive !== false,
        template: template
    };
}

function normaliseOptions(pathOrOptions, debug) {
    if (pathOrOptions.constructor === String)
        pathOrOptions = { path: pathOrOptions };
    if (debug === true)
        pathOrOptions.debug = true;
    return pathOrOptions;
}Pack.templates['Pack.embedTemplate'] = 'Pack.templates[\'<%=path.filename().toString().replace(".template.js", "")%>\'] = \'<%=T.embedString(content)%>\';\n';
Pack.templates['T.document'] = '<%= data.documentation(content) %>';
Pack.templates['T.mockjax.outer'] = '<%= content %>\n<%= data.mockGaps() %>';
Pack.templates['T.mockjax'] = '$.mockjax({\n    url: \'<%= pathRelativeToConfig %>\',\n    responseText: \'<%= T.embedString(content) %>\',\n    responseTime: 0\n});\n<% data.registerUrl(pathRelativeToConfig) %>';
Pack.templates['T.Model'] = '<%=T.modelScriptEnvironment(pathRelativeToInclude, data.prefix)%>\n<%=content%>\n';
Pack.templates['T.Script.debug'] = 'window.eval("<%= T.prepareForEval(content) + T.sourceUrlTag(pathRelativeToConfig, data.domain, data.protocol) %>");\n';
Pack.templates['T.Script'] = '// <%= pathRelativeToConfig %>\n<%= content %>\n';
Pack.templates['T.Style'] = '//<% if(!target.includesStylesheetHelper) { %>\nwindow.__appendStyle = function (content) {\n    var element = document.getElementById(\'__tribeStyles\');\n    if (!element) {\n        element = document.createElement(\'style\');\n        element.className = \'__tribe\';\n        element.id = \'__tribeStyles\';\n        document.getElementsByTagName(\'head\')[0].appendChild(element);\n    }\n\n    if(element.styleSheet)\n        element.styleSheet.cssText += content;\n    else\n        element.appendChild(document.createTextNode(content));\n};//<% target.includesStylesheetHelper = true; } %>\nwindow.__appendStyle(\'<%= api.MinifyStylesheet.minify(content).replace(/\\\'/g, "\\\\\'") %>\');';
Pack.templates['T.Template'] = '//<% if(!target.includesTemplateHelper) { %>\nwindow.__appendTemplate = function (content, id) {\n    var element = document.createElement(\'script\');\n    element.className = \'__tribe\';\n    element.setAttribute(\'type\', \'text/template\');\n    element.id = id;\n    element.text = content;\n    document.getElementsByTagName(\'head\')[0].appendChild(element);\n};//<% target.includesTemplateHelper = true; } %>\nwindow.__appendTemplate(\'<%=T.embedString(content)%>\', \'<%=T.templateIdentifier(pathRelativeToInclude, data.prefix)%>\');';
(function () {
    var fs = require('fs');

    Pack.api.Files = {
        getFilenames: function (filespec, recursive) {
            return listTree(filespec, recursive);
        },
        getFileContents: function (files) {
            if (files.constructor === Array)
                return files.reduce(function (result, file) {
                    result[file] = readFile(file);
                    return result;
                }, {});
            else
                return readFile(files);
        },
        writeFile: function (path, content) {
            return fs.writeFileSync(path, content);
        },
        copyFile: function (from, to) {
            this.writeFile(to, this.getFileContents(from));
        }
    };
    
    function readFile(path) {
        var content = fs.readFileSync(path, 'utf8');
        if (content.charCodeAt(0) == 65279)
            return content.substring(1);
        return content;
    }

    function listTree(filespec, recursive) {
        filespec = Path(filespec || './*.*');

        var filter = filespec.filename().toString();
        var basePath = filespec.withoutFilename().toString();
        var paths = [];
        var childDirectories = [];
        
        var children = fs.readdirSync(basePath);

        children.forEach(function (child) {
            var fullChild = basePath + child;
            var stat = fs.statSync(fullChild);

            if (!stat.isDirectory() && Path(fullChild).match(filespec))
                paths.push(fullChild);

            if (stat.isDirectory() && recursive)
                childDirectories.push(fullChild);
        });

        // we want to process child directories after the directory contents
        childDirectories.forEach(function(child) {
            paths.push.apply(paths, listTree(child + '/' + filter));
        });
        
        return paths;
    }
})();
Pack.api.Log = (function () {
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
            level = levels[newLevel] || 4;
        },
        debug: function (message) {
            if (level >= 4) 
                console.log('DEBUG: ' + message);
        },
        info: function(message) {
            if (level >= 3)
                console.info('INFO: ' + message);
        },
        warn: function(message) {
            if (level >= 2)
                console.warn('WARN: ' + message);
        },
        error: function(message) {
            if (level >= 1)
                console.error('ERROR: ' + message);
        }
    };
})();
Pack.api.MinifyJavascript = {
    minify: function(source) {
        return source;
    }
};

Pack.api.MinifyStylesheet = {
    minify: function(source) {
        return source;
    }
};function integrationTest(path, tests) {
    QUnit.module('Integration.' + path, {
        setup: function() {
            Pack.api.Files = {
                getFilenames: function(filespec, recursive) {
                    return originalApi.getFilenames(filespec, recursive);
                },
                getFileContents: function(files) {
                    return originalApi.getFileContents(files);
                },
                writeFile: sinon.spy(),
                copyFile: sinon.spy()
            };
            pack = new Pack.Api({ throttle: false }).pack;
            pack.scanForResources('Tests/Integration/' + path + '/').all();
        }
    });

    function outputAssertions(file) {
        return {
            equals: function(value) {
                equal(output(file), value, file);
            },
            contains: function(value) {
                ok(output(file).indexOf(value) !== -1, file + ' contains "' + value + '"');
            },
            containsOnce: function(value) {
                var fileOutput = output(file);
                var firstIndex = fileOutput.indexOf(value);
                ok(firstIndex !== -1 && fileOutput.indexOf(value, firstIndex + value.length) === -1,
                    "The string '" + fileOutput + "' contains the value '" + value + "' only once.");
            }
        };
    }

    test(path, function() {
        tests(outputAssertions);
    });

    function output(file) {
        var Files = Pack.api.Files;
        for (var i = 0, l = Files.writeFile.callCount; i < l; i++) {
            var call = Files.writeFile.getCall(i);
            var path = call.args[0];
            if (path.indexOf('/' + file, path.length - file.length - 1) !== -1)
                return call.args[1];
        }
    }
}

var sinon = require('sinon');
_.extend(global, instance);
var originalApi = Pack.api.Files;QUnit.module('Api.Files');

test("getFilenames returns array of files in specified folder", function() {
    var files = Pack.api.Files.getFilenames('Tests/Api/Files/*.*');
    equal(files.length, 1);
    equal(files[0], 'Tests/Api/Files/root.txt');
});

test("getFilenames recurses when specified", function () {
    var files = Pack.api.Files.getFilenames('Tests/Api/Files/*.*', true);
    equal(files.length, 2);
    equal(files[0], 'Tests/Api/Files/root.txt');
    equal(files[1], 'Tests/Api/Files/Child/child.txt');
});

test("getFileContents returns string contents of specified file", function() {
    equal(Pack.api.Files.getFileContents('Tests/Api/Files/root.txt'), 'root');
});

test("getFileContents returns hash of path to string contents for specified array of files", function () {
    var contents = Pack.api.Files.getFileContents(['Tests/Api/Files/root.txt', 'Tests/Api/Files/Child/child.txt']);
    equal(contents['Tests/Api/Files/root.txt'], 'root');
    equal(contents['Tests/Api/Files/Child/child.txt'], 'child');
});

test("writeFile writes specified string to target file", function () {
    var value = _.random(1, 10);
    Pack.api.Files.writeFile('Tests/Api/Files/test.txt', value);
    equal(Pack.api.Files.getFileContents('Tests/Api/Files/test.txt'), value);
    require('fs').unlinkSync('Tests/Api/Files/test.txt');
});

test("copyFile copies specified source file to target", function () {
    var value = _.random(1, 10);
    Pack.api.Files.copyFile('Tests/Api/Files/root.txt', 'Tests/Api/Files/' + value);
    equal(Pack.api.Files.getFileContents('Tests/Api/Files/' + value), 'root');
    require('fs').unlinkSync('Tests/Api/Files/' + value);
});integrationTest('Combine', function(output) {
    output('nonrecursive').equals('root.jsroot.txt');
    output('recursive').equals('root.jsroot.txtsubfolder.jssubfolder.txt');
    output('individualIncludes').equals('root.jssubfolder.jsroot.txt');
    output('subfolder').equals('subfolder.jssubfolder.txt');
    output('excludes').equals('root.jssubfolder.js');
    output('simplePrioritise').equals('root.txtroot.js');
    output('prioritise').equals('root.txtsubfolder.txtroot.jssubfolder.js');
    output('last').equals('root.jssubfolder.jsroot.txtsubfolder.txt');
    output('multiple1').equals('root.jsroot.txt');
    output('multiple2').equals('root.txtroot.js');
    output('alternate').equals('root.jsroot.txt');
    output('alternateArray').equals('root.jssubfolder.js');
});
integrationTest('Embedded', function(output) {
    output('styles').containsOnce("__appendStyle = function");
    output('templates').containsOnce("__appendTemplate = function");
});
/*
            api.Output("styles").Should().ContainOnce("__appendStyle = function");
        }

        [Test]
        public void Template_render_helpers_are_only_included_once()
        {
            api.Output("templates").Should().ContainOnce("__appendTemplate = function");

*/Context = {};

function filesAsMock() {
    Pack.api.Files = {
        getFilenames: function(path, filter, recursive) {
            return _.keys(Pack.api.Files.files);
        },
        getFileContents: function(files) {
            var result = {};
            for (var i = 0; i < files.length; i++)
                result[files[i]] = Pack.api.Files.files[files[i]];
            return result;
        },
        writeFile: function(path, content) {
            Pack.api.Files.files[path] = content;
        },
        files: {}
    };
};

function filesAsSpy() {
    Pack.api.Files = {
        getFilenames: sinon.spy(),
        getFileContents: sinon.spy(),
        writeFile: sinon.spy(),
        copyFile: sinon.spy()
    };
};

function minifierAsSpy() {
    Pack.api.MinifyJavascript = { minify: sinon.spy() };
    Pack.api.MinifyMarkup = { minify: sinon.spy() };
    Pack.api.MinifyStylesheet = { minify: sinon.spy() };
}function wrap(value, output, target, options) {
    return {
        value: value,
        output: output,
        target: target || new Pack.Container(),
        options: options || {}
    };
}(function () {
    var api;
    
    QUnit.module('Api', {
        setup: function () { api = new Pack.Api(); }
    });

    test("pack converts strings to include transform", function () {
        api.pack('*.js');
        equal(api.pack.outputs.length, 1);
        equal(api.pack.outputs[0].transforms.include, '*.js');
    });

    test("pack converts arrays to include transform", function () {
        var files = ['*.js', '*.txt'];
        api.pack(files);
        equal(api.pack.outputs.length, 1);
        equal(api.pack.outputs[0].transforms.include, files);
    });

    test("pack returns wrapper object when passed a string", function() {
        var wrapper = api.pack('*.*');
        ok(wrapper.to);
        equal(wrapper.output.transforms.include, '*.*');
    });

    test("pack returns wrapper object when passed an object", function() {
        var wrapper = api.pack({ to: 'target' });
        ok(wrapper.to);
        equal(wrapper.output.transforms.to, 'target');
    });

    test("pack returns array of wrapper objects when passed multiple arguments", function () {
        var wrappers = api.pack({}, {});
        equal(wrappers.length, 2);
        ok(wrappers[0].to);
        ok(wrappers[1].to);
    });

    test("pack.to adds single target when passed a string", function() {
        api.pack('*.js').to('output.js');
        equal(api.pack.outputs.length, 1);
        equal(api.pack.outputs[0].transforms.to, 'output.js');
    });

    test("pack.to adds an output for each target", function () {
        api.pack({}).to({ '1': {}, '2': {} });
        equal(api.pack.outputs.length, 2);
    });

    test("pack.to sets 'to' transform from object key", function () {
        api.pack({}).to({ '1': {} });
        equal(api.pack.outputs[0].transforms.to, '1');
    });

    test("pack.to merges transforms from each target", function () {
        api.pack({ '1': 1 }).to({ target1: { '2': 2 }, target2: { '3': 3 } });
        equal(api.pack.outputs[0].transforms['1'], 1);
        equal(api.pack.outputs[0].transforms['2'], 2);
        equal(api.pack.outputs[0].transforms['3'], undefined);
        equal(api.pack.outputs[1].transforms['1'], 1);
        equal(api.pack.outputs[1].transforms['2'], undefined);
        equal(api.pack.outputs[1].transforms['3'], 3);
    });

    test("api.pack.to overrides existing transforms", function () {
        api.pack({ '1': 1 }).to({ target1: { '1': 2 } });
        equal(api.pack.outputs[0].transforms['1'], 2);
    });

    test("sync renames 'to' property to 'syncTo'", function() {
        equal(api.sync({ to: 'target' }).output.transforms.syncTo, 'target');
    });

    test("sync.to adds single target when passed a string", function () {
        api.sync('*.js').to('output');
        equal(api.pack.outputs.length, 1);
        equal(api.pack.outputs[0].transforms.syncTo, 'output');
    });

    test("sync.to adds an output for each target", function () {
        api.sync('*.*').to({ '1': {}, '2': {} });
        equal(api.pack.outputs.length, 2);
    });
})();
(function () {
    var p;
    
    QUnit.module("commands", { setup: setup });

    test("build writes full output", function () {
        Pack.api.Files.files = {
            'test.js': 'var test = "test";'
        };
        Pack.api.Files.writeFile = sinon.spy();
        var output = new Pack.Output({ to: "output.js", include: "test.js" }, "path/");
        p.build(output);
        ok(Pack.api.Files.writeFile.calledOnce);
        equal(Pack.api.Files.writeFile.firstCall.args[1], 'var test = "test";');
        //equal(output.output, 'var test = "test";');
    });

    test("build recurses when output path matches other outputs", function () {
        Pack.api.Files.getFilenames = getFilenames;
        Pack.api.Files.getFileContents = getFileContents;
        var parent = p.addOutput({ include: 'parent', to: 'child' }, '');
        var child = p.addOutput({ include: 'child', to: 'output' }, '');
        var spy = sinon.spy();
        child.build = spy;

        p.all();
        ok(spy.called);

        function getFilenames(name) {
            return name === 'parent' ? ['parent'] : ['child'];
        }

        function getFileContents(files) {
            return files[0] === 'parent' ? { 'parent': 'parent' } : { 'child': 'child' };
        }
    });

    test("fileChanged updates config when called with config path", function() {
        Pack.api.Files.files['/test/test.pack.js'] = 'Test= "test"';
        p.scanForConfigs('/');
        equal(Test, 'test');
        Pack.api.Files.files['/test/test.pack.js'] = 'Test = "test2"';
        p.fileChanged('/test/test.pack.js');
        equal(Test, 'test2');
    });

    function setup() {
        p = new Pack({ throttle: false });
        filesAsMock(p);
    }
})();
(function () {
    QUnit.module("FileList");

    test("include adds single string", function () {
        var files = new FileList()
            .include('test');
        equal(files.list.length, 1);
        equal(files.list[0].path, 'test');
    });

    test("include adds single object", function () {
        var files = new FileList().include({ path: 'test' });
        equal(files.list.length, 1);
        equal(files.list[0].path, 'test');
    });

    test("include maps array of strings", function () {
        var files = new FileList().include(['test', 'test2']);
        equal(files.list.length, 2);
        equal(files.list[0].path, 'test');
        equal(files.list[1].path, 'test2');
    });

    test("include maps array of objects", function () {
        var files = new FileList().include([{ path: 'test', template: '' }, { path: 'test2', template: '' }]);
        equal(files.list.length, 2);
        equal(files.list[0].path, 'test');
        equal(files.list[1].path, 'test2');
    });

    test("exclude removes string from existing list", function() {
        var files = new FileList()
            .include(['test', 'test2'])
            .exclude('test');
        equal(files.list.length, 1);
        equal(files.list[0].path, 'test2');
    });

    test("exclude removes object from existing list", function () {
        var files = new FileList()
            .include(['test', 'test2'])
            .exclude({ path: 'test' });
        equal(files.list.length, 1);
        equal(files.list[0].path, 'test2');
    });

    test('filter removes objects from existing list by evaluating function', function() {
        var files = new FileList()
            .include(['1.js', '2.txt', '3.txt'])
            .filter(ifJavascript);
        equal(files.list.length, 1);
        equal(files.list[0].path, '1.js');
    });
    
    function ifJavascript(path) {
        return path.indexOf('.js', path.length - 3) !== -1;
    }

    test("list is initialised with constructor parameters", function() {
        var files = new FileList('test', 'test2');
        equal(files.list.length, 2);
        equal(files.list[0].path, 'test');
        equal(files.list[1].path, 'test2');
    });

    test("isEmpty returns true when list contains no files", function() {
        var files = new FileList()
            .include(['test'])
            .exclude({ path: 'test' });
        ok(files.isEmpty());
    });

    test("prioritise moves file with matching filename to the top of the list", function() {
        var files = new FileList()
            .include(['Path/1.js', 'Path/2.js', 'Path/3.js'])
            .prioritise('2.js');
        equal(files.list[0].path, 'Path/2.js');
    });
    
    test("when last parameter set, prioritise moves file with matching filename to the bottom of the list", function () {
        var files = new FileList()
            .include(['Path/1.js', 'Path/2.js', 'Path/3.js'])
            .prioritise('2.js', true);
        equal(files.list[2].path, 'Path/2.js');
    });
})();
(function () {
    QUnit.module("Output", { setup: filesAsMock });

    test("matches returns true if file list contains file", function() {
        var output = new Pack.Output({ include: '*.*' }, '');
        Pack.api.Files.files = ['1', '1', '2', '3'];
        ok(output.matches('2', new Pack.TransformRepository(Pack.transforms)));
    });

    test("matchingOutputs returns array of outputs matching file", function() {
        var p = new Pack();
        createOutput('1', true);
        createOutput('2', true);
        createOutput('3', false);
        equal(p.matchingOutputs().length, 2);

        function createOutput(name, matches) {
            var output = p.addOutput({ to: name }, '');
            output.matches = function() {
                return matches;
            };
        }
    });

    test("removeConfigOutputs removes outputs with matching config file", function() {
        var p = new Pack();
        p.outputs = [{ configPath: 'config' }, { configPath: 'config' }, { configPath: 'config2' }];
        p.removeConfigOutputs('config');
        equal(p.outputs.length, 1);
    });

    test("configOutputs returns all outputs with specified configPath", function() {
        var p = new Pack();
        p.outputs = [{ configPath: 'config' }, { configPath: 'config' }, { configPath: 'config2' }];
        var outputs = p.configOutputs('config');
        equal(outputs.length, 2);
    });

    test("executeTransform executes the appropriate transform", function () {
        expect(1);
        var p = new Pack();
        var output = new Pack.Output({ test: 'value' }, '');
        p.transforms.add('test', '', function(value) {
            equal(value, 'value');
        });
        p.executeTransform('test', output);
    });
})();
(function () {
    var pack;

    QUnit.module('Pack', {
        setup: function () { pack = new Pack(); }
    });

    test("addOutput accepts single objects", function () {
        pack.addOutput({});
        equal(pack.outputs.length, 1);
    });

    test("addOutput accepts arrays", function () {
        pack.addOutput([{}, {}]);
        equal(pack.outputs.length, 2);
    });

    test("addOutput accepts nested arrays", function () {
        pack.addOutput([{}, [{}, {}]]);
        equal(pack.outputs.length, 3);
    });
})();
(function () {
    QUnit.module("Path");

    test('Path handles empty arguments', function() {
        equal(Path('').toString(), '');
        equal(Path(undefined).toString(), '');
        equal(Path(null).toString(), '');
    });

    test("withoutFilename", function () {
        equal(Path("/folder/subfolder/filename.ext").withoutFilename().toString(), "/folder/subfolder/", "Path with slashes");
        equal(Path("\\folder\\subfolder\\filename.ext").withoutFilename().toString(), "\\folder\\subfolder\\", "Path with backslashes");
    });

    test("filename", function () {
        equal(Path("filename.ext").filename().toString(), "filename.ext", "Filename");
        equal(Path("/filename.ext").filename().toString(), "filename.ext", "Root path filename");
        equal(Path("/folder/subfolder/filename.ext").filename().toString(), "filename.ext", "Path with slashes");
        equal(Path("\\folder\\subfolder\\filename.ext").filename().toString(), "filename.ext", "Path with backslashes");
    });

    test("extension", function () {
        equal(Path("filename.ext").extension().toString(), "ext", "Filename");
        equal(Path("/filename.ext").extension().toString(), "ext", "Root path filename");
        equal(Path("filename").extension().toString(), "", "Filename without extension");
        equal(Path("/filename").extension().toString(), "", "Root path filename without extension");
        equal(Path("filename.").extension().toString(), "", "Empty extension");
        equal(Path("/folder/subfolder/filename.ext").extension().toString(), "ext", "Path with slashes");
        equal(Path("\\folder\\subfolder\\filename.ext").extension().toString(), "ext", "Path with backslashes");
    });

    test("withoutExtension", function () {
        equal(Path("filename.ext").withoutExtension().toString(), "filename");
        equal(Path("filename").withoutExtension().toString(), "filename");
        equal(Path("/test/filename.ext").withoutExtension().toString(), "/test/filename");
        equal(Path("/test/filename").withoutExtension().toString(), "/test/filename");
        equal(Path("/test/filename.ext").filename().withoutExtension().toString(), "filename");
        equal(Path("/test/filename").filename().withoutExtension().toString(), "filename");
    });

    test("Path objects can be concatenated with strings", function() {
        equal(Path('/folder/filename.ext').withoutFilename() + 'new.ext', '/folder/new.ext');
    });

    test("isAbsolute", function() {
        ok(Path("/test/").isAbsolute());
        ok(Path("\\test\\").isAbsolute());
        ok(Path("C:\\test\\").isAbsolute());
        ok(!Path("test\\").isAbsolute());
    });
    
    test("makeAbsolute", function () {
        equal(Path("/test").makeAbsolute().toString(), "/test");
        equal(Path("test").makeAbsolute().toString(), "/test");
        equal(Path("test.txt").makeAbsolute().toString(), "/test.txt");
        equal(Path("test/test.txt").makeAbsolute().toString(), "/test/test.txt");
    });

    test("makeRelative", function () {
        equal(Path("test").makeRelative().toString(), "test");
        equal(Path("/test").makeRelative().toString(), "test");
        equal(Path("/test.txt").makeRelative().toString(), "test.txt");
        equal(Path("/test/test.txt").makeRelative().toString(), "test/test.txt");
        equal(Path("\\test\\test.txt").makeRelative().toString(), "test\\test.txt");
    });

    test("match", function () {
        equal(Path("test.js").match("test.js"), "test.js");
        equal(Path("test\\test.js").match("test.js"), "test.js");
        equal(Path("test.js").match("*.js"), "test.js");
        //ok(!Path("atest.js").match("test.js"));
        ok(!Path("test.jsa").match("test.js"));
        ok(!Path("test.jsa").match("*.js"));

        equal(Path("c:\\test\\test.js").match("test.js"), "test.js");
        equal(Path("c:\\test\\test.js").match("*.js"), "test.js");
        equal(Path("c:\\test\\test.js").match("test\\test.js"), "test\\test.js");
        equal(Path("c:\\test\\test.js").match("test\\*.js"), "test\\test.js");
        equal(Path("c:\\test\\test.js").match("test/test.js"), "test\\test.js");
        equal(Path("c:\\test\\test.js").match("test/*.js"), "test\\test.js");

        equal(Path("c:\\test\\pack.js").match("*pack.js"), "pack.js");
        equal(Path("c:\\test\\test.pack.js").match("*pack.js"), "test.pack.js");
        equal(Path("c:\\test\\test2\\pack.js").match("*pack.js"), "pack.js");
        equal(Path("c:\\test\\test2\\test.pack.js").match("*pack.js"), "test.pack.js");

        ok(!Path("c:\\test\\test.js").match("*.txt"));
        ok(!Path("c:\\test\\test.js").match("test.txt"));
        ok(!Path("c:\\test\\test.js").match("test2.js"));
        ok(!Path("c:\\test\\test.js").match("test2\\*.js"));
        ok(!Path("c:\\test\\test.js").match("test2\\test.js"));
        ok(!Path("c:\\test\\testajs").match("test\\test.js"));

        equal(Path("test.js").match("*.*"), "test.js");
        equal(Path("test.pack.js").match("*.*"), "test.pack.js");
        equal(Path("\\test\\test.js").match("*.*"), "test.js");
        equal(Path("/test/test.js").match("*.*"), "test.js");
        equal(Path("c:\\test\\test.js").match("*.*"), "test.js");
        //equal(Path("test").match("*.*"), "test");
        //equal(Path("test").match("*."), "test");
        equal(Path("test").match("*"), "test");
        equal(Path("test.js").match("*"), "test.js");
        equal(Path("c:\\test\\test.js").match(".js"), ".js");
    });

    test("matchFolder", function() {
        equal(Path("c:\\path\\to\\test.txt").matchFolder("\\path"), "\\path");
        equal(Path("c:\\path\\to\\test.txt").matchFolder("/path"), "\\path");
        equal(Path("c:\\path\\to\\test.txt").matchFolder("\\path\\to"), "\\path\\to");
        equal(Path("c:\\path\\to\\test.txt").matchFolder("/path/to"), "\\path\\to");
        equal(Path("c:\\path\\to\\test.txt").matchFolder("c:\\path\\to"), "c:\\path\\to");
        equal(Path("c:\\path\\to\\test.txt").matchFolder("c:\\path/to"), "c:\\path\\to");
    });

    test("normalise", function () {
        equal(Path('test').toString(), 'test');
        equal(Path('../test').toString(), '../test');
        equal(Path('test1/../test2').toString(), 'test2');
        equal(Path('/test1/../test2').toString(), '/test2');
        equal(Path('/test1/../test2/../test3').toString(), '/test3');
        equal(Path('./test').toString(), 'test');
        equal(Path('test1/./test2').toString(), 'test1/test2');
        equal(Path('.././test1/../test2').toString(), '../test2');
        equal(Path('C:\\test\\..\\test.txt').toString(), 'C:\\test.txt');
        equal(Path('C:\\test\\..\\.\\test.txt').toString(), 'C:\\test.txt');
        equal(Path('..\\..\\test\\').toString(), '..\\..\\test\\');
    });

    test("asPathIdentifier", function() {
        equal(Path('test.txt').asMarkupIdentifier().toString(), 'test');
        equal(Path('test/test.txt').asMarkupIdentifier().toString(), 'test-test');
    });
})();
(function () {
    var p;
    
    QUnit.module("templates", { setup: setup });

    test("scanForTemplates loads files and passes to loadConfig", function () {
        Pack.api.Files.files = {
            'test1.template.htm': '1',
            'test2.template.js': '2'
        };

        p.scanForTemplates();
        equal(p.templates.test1, '1');
        equal(p.templates.test2, '2');
    });


    QUnit.module("configs", { setup: setup });

    test("scanForConfigs loads files and passes to loadConfig", function () {
        Pack.api.Files.files = {
            'test.pack.js': 'pack();',
            'test.js': 'var test = "test";'
        };

        p.loadConfig = sinon.spy();
        p.scanForConfigs();
        ok(p.loadConfig.calledTwice);
        ok(p.loadConfig.calledWithExactly('test.pack.js', Pack.api.Files.files['test.pack.js']));
        ok(p.loadConfig.calledWithExactly('test.js', Pack.api.Files.files['test.js']));
    });

    test("loadConfig logs error when source has invalid syntax", function () {
        Pack.utils.logError = sinon.spy();
        p.loadConfig('path', 'invalid syntax');
        ok(Pack.utils.logError.calledOnce);
    });

    test("loadConfig logs error when source throws", function () {
        Pack.utils.logError = sinon.spy();
        p.loadConfig('path', 'throw "test";');
        ok(Pack.utils.logError.calledOnce);
        ok(Pack.utils.logError.calledWithExactly('test'));
    });

    test("loadConfig evaluates script with access to global scope", function () {
        p.loadConfig('path', 'this.globalTest = "test"');
        equal(globalTest, "test");
        delete globalTest;
    });

    test("loadConfig evaluates script in private scope", function () {
        p.loadConfig('path', 'var privateTest = "test"');
        raises(function () { var test3 = privateTest; });
    });
    
    function setup() {
        filesAsMock();
        p = new Pack();
    }
})();
(function () {
    QUnit.module("utils");

    test("executeSingleOrArray returns array if passed array", function () {
        var result = Pack.utils.executeSingleOrArray([1, 2], function (value) { return value * 2; });
        equal(result.length, 2);
        equal(result[0], 2);
        equal(result[1], 4);
    });

    test("executeSingleOrArray handles arguments object", function () {
        (function() {
            var result = Pack.utils.executeSingleOrArray(arguments, function() { });
            equal(result.length, 3);
        })(1, 2, 3);
    });

    test("executeSingleOrArray flattens arrays if requested", function () {
        var result = Pack.utils.executeSingleOrArray([1, [2, 3]], function () { }, true);
        equal(result.length, 3);
    });
})();
QUnit.module('Embedded.T.document');

var source = loadSource();

test("extractDocumentation trims and concatenates", function () {
    var d = T.document.extractDocumentation("test\n   ////    { \n////           test: 'test\n////description'\ntest\n////}");
    equal(d, "{ test: 'test description' }");
});

test("findOrCreateNamespace finds existing namespace", function() {
    var target = { test1: { test2: { test3: {} } } };
    equal(T.document.findOrCreateNamespace(target, 'test1.test2'), target.test1.test2);
});

test("findOrCreateNamespace creates new namespace", function () {
    var target = { };
    equal(T.document.findOrCreateNamespace(target, 'test1.test2'), target.test1.test2);
});

test("captureMembers constructs namespace tree", function() {
    var documentation = T.document.extractDocumentation(source);
    var result = T.document.captureMembers(documentation);
    ok(result.Test);
    ok(result.Test.test1);
    ok(result.Test.test1.functions);
    equal(result.Test.test1.functions.length, 1);
    equal(result.Test.test1.functions[0].name, 'blah');
});

test("captureMembers logs error if documentation is invalid", function() {
    log = { error: sinon.spy() };
    T.document.captureMembers('invalid javascript');
    ok(log.error.calledOnce);
});

function loadSource() {
    //var result;
    //$.ajax({
    //    url: 'Core/Embedded/source.js',
    //    async: false,
    //    success: function(content) {
    //        result = content;
    //    }
    //});
    //return result;
    return '//// namespace(\'Test.test1\');\n//// func({ name: \'blah\', \n////     description: \'test\n////                   test\', arguments: [{}], returns: \'test\' });\nfunction blah() { }';
}QUnit.module('Embedded.T.scripts');

test("Specifying folder includes all js files", function() {
    var include = T.scripts('Scripts');
    equal(include.files, 'Scripts/*.js');
});

test("Specifying file includes single file", function () {
    var include = T.scripts('test.js');
    equal(include.files, 'test.js');
});

test("Specifying filespec includes filespec", function () {
    var include = T.scripts('Tests/*.tests.js');
    equal(include.files, 'Tests/*.tests.js');
});

test("T.Script template is used if debug is not specified", function () {
    var include = T.scripts('Scripts');
    var output = { transforms: {} };
    equal(include.template(output).name, 'T.Script');
});

test("T.Script.debug template is used if debug transform is specified", function () {
    var include = T.scripts('Scripts', true);
    var output = { transforms: { debug: true } };
    equal(include.template(output).name, 'T.Script.debug');
});

test("Path can be specified in object", function () {
    var include = T.scripts({ path: 'Scripts' });
    equal(include.files, 'Scripts/*.js');
});

test("Debug can be specified in object", function () {
    var include = T.scripts({ path: 'Scripts', debug: true });
    var output = { transforms: {} };
    equal(include.template(output).name, 'T.Script.debug');
});

QUnit.module('Embedded.T.panes');

test("T.panes includes relevant files from specified folder", function () {
    var includes = T.panes('Panes');
    equal(includes.length, 3);
    equal(includes[0].files, 'Panes/*.js');
    equal(includes[1].files, 'Panes/*.htm');
    equal(includes[2].files, 'Panes/*.css');
});

QUnit.module('Embedded.T.models');

test("T.models uses model and script templates", function () {
    var include = T.models('Panes');
    var template = include.template({ transforms: {} });
    equal(template.length, 2);
    equal(template[0].name, 'T.Model');
    equal(template[1].name, 'T.Script');
});(function () {
    QUnit.module("transforms.files", { setup: filesAsSpy });

    test("include calls getFilenames with correct arguments when string is passed", function () {
        Pack.transforms.include.apply(wrap('*.js', new Pack.Output({ recursive: true }, 'path/'), new Pack.Container()));
        ok(Pack.api.Files.getFilenames.calledOnce);
        ok(Pack.api.Files.getFilenames.calledWithExactly('path/*.js', true));
    });

    test("include calls getFilenames with correct arguments when object is passed", function () {
        Pack.transforms.include.apply(wrap({ files: '*.js', recursive: false }, new Pack.Output({ recursive: true }, 'path/'), new Pack.Container()));
        ok(Pack.api.Files.getFilenames.calledOnce);
        ok(Pack.api.Files.getFilenames.calledWithExactly('path/*.js', false));
    });

    test("include calls getFilenames with correct arguments when function is passed", function () {
        Pack.transforms.include.apply(wrap(function() { return { files: '*.js', recursive: false }; }, new Pack.Output({ recursive: true }, 'path/'), new Pack.Container()));
        ok(Pack.api.Files.getFilenames.calledOnce);
        ok(Pack.api.Files.getFilenames.calledWithExactly('path/*.js', false));
    });

    test("include calls getFilenames with correct arguments when function is passed and no list exists", function () {
        Pack.transforms.include.apply(wrap(function () { }, new Pack.Output({ recursive: true }, 'path/'), new Pack.Container()));
        ok(Pack.api.Files.getFilenames.calledOnce);
        ok(Pack.api.Files.getFilenames.calledWithExactly('path/*.*', true));
    });

    test("include calls getFilenames twice when two values are passed", function() {
        Pack.transforms.include.apply(wrap(['*.js', { files: '*.txt', recursive: true }], new Pack.Output({}, 'path/'), new Pack.Container()));
        ok(Pack.api.Files.getFilenames.calledTwice);
        ok(Pack.api.Files.getFilenames.calledWithExactly('path/*.js', false));
        ok(Pack.api.Files.getFilenames.calledWithExactly('path/*.txt', true));
    });

    test("include values can be nested recursively", function() {
        Pack.transforms.include.apply(wrap(['*.js', ['*.htm', ['*.css']]], new Pack.Output({}, 'path/'), new Pack.Container()));
        ok(Pack.api.Files.getFilenames.calledThrice);
        ok(Pack.api.Files.getFilenames.calledWithExactly('path/*.js', false));
        ok(Pack.api.Files.getFilenames.calledWithExactly('path/*.htm', false));
        ok(Pack.api.Files.getFilenames.calledWithExactly('path/*.css', false));
    });

    test("include sets config and include path values", function() {
        Pack.api.Files.getFilenames = sinon.stub().returns(['path/subfolder/file']);
        var output = new Pack.Output({}, 'path/');
        var data = new Pack.Container();
        Pack.transforms.include.apply(wrap('subfolder/*.js', output, data));
        equal(data.files.list.length, 1);
        equal(data.files.list[0].includePath.toString(), 'path/subfolder/');
        equal(data.files.list[0].pathRelativeToInclude.toString(), 'file');
        equal(data.files.list[0].configPath.toString(), 'path/');
        equal(data.files.list[0].pathRelativeToConfig.toString(), 'subfolder/file');
    });

    test("setting template include option overrides template transform value", function() {
        Pack.api.Files.getFilenames = sinon.stub().returns(['file']);
        var output = new Pack.Output({ template: 'test1' }, 'path/');
        var data = new Pack.Container();
        Pack.transforms.include.apply(wrap([{ template: 'test2' }], output, data));
        equal(data.files.list.length, 1);
        equal(data.files.list[0].template, 'test2');
    });

    test("prioritise moves single file to top of file list", function () {
        var output = new Pack.Output({}, 'path/');
        var data = new Pack.Container();
        Pack.api.Files.getFilenames = sinon.stub().returns(['file1', 'file2', 'file3']);
        Pack.transforms.include.apply(wrap({ prioritise: 'file2' }, output, data));
        equal(data.files.list.length, 3);
        equal(data.files.list[0].path, 'file2');
        equal(data.files.list[1].path, 'file1');
        equal(data.files.list[2].path, 'file3');
    });

    test("prioritise moves array of files to top of file list", function () {
        Pack.api.Files.getFilenames = sinon.stub().returns(['file1', 'file2', 'file3']);
        var output = new Pack.Output({}, 'path/');
        var data = new Pack.Container();
        Pack.transforms.include.apply(wrap({ prioritise: ['file3', 'file2'] }, output, data));
        
        equal(data.files.list.length, 3);
        equal(data.files.list[0].path, 'file3');
        equal(data.files.list[1].path, 'file2');
        equal(data.files.list[2].path, 'file1');
    });
    
    test("first is an alias for prioritise", function () {
        equal(Pack.transforms.first.apply, Pack.transforms.prioritise.apply);
    });

    test("last moves single file to bottom of file list", function () {
        var output = new Pack.Output({}, 'path/');
        var data = new Pack.Container();
        Pack.api.Files.getFilenames = sinon.stub().returns(['file1', 'file2', 'file3']);
        Pack.transforms.include.apply(wrap({ last: 'file2' }, output, data));
        equal(data.files.list.length, 3);
        equal(data.files.list[0].path, 'file1');
        equal(data.files.list[1].path, 'file3');
        equal(data.files.list[2].path, 'file2');
    });

    test("last moves array of files to bottom of file list", function () {
        Pack.api.Files.getFilenames = sinon.stub().returns(['file1', 'file2', 'file3']);
        var output = new Pack.Output({}, 'path/');
        var data = new Pack.Container();
        Pack.transforms.include.apply(wrap({ last: ['file1', 'file2'] }, output, data));

        equal(data.files.list.length, 3);
        equal(data.files.list[0].path, 'file3');
        equal(data.files.list[1].path, 'file1');
        equal(data.files.list[2].path, 'file2');
    });

    test("excludeDefaults excludes config files", function () {
        var data = { files: new FileList('1', '3') };
        pack.loadedConfigs = ['3'];
        Pack.transforms.excludeDefaults.apply(wrap(true, { transforms: {} }, data));
        equal(data.files.list.length, 1);
        equal(data.files.list[0].path, '1');
    });

    test("excludeDefaults includes config files if includeConfigs transform is specified", function() {
        var data = { files: new FileList('1', '3') };
        pack.loadedConfigs = ['3'];
        Pack.transforms.excludeDefaults.apply(wrap(true, { transforms: { includeConfigs: true } }, data));
        equal(data.files.list.length, 2);
    });
    
    test("excludeDefaults excludes output file", function () {
        var data = { files: new FileList('1', '3') };
        Pack.transforms.excludeDefaults.apply(wrap(true, { outputPath: '3', transforms: { } }, data));
        equal(data.files.list.length, 1);
        equal(data.files.list[0].path, '1');
    });

})();
(function () {
    QUnit.module("transforms.minify", { setup: minifierAsSpy });
    
    test("minify calls appropriate API functions", function () {        
        Pack.transforms.minify.apply(wrap(true, { transforms: { to: 'test.js' } }, { output: 'js' }));
        Pack.transforms.minify.apply(wrap(true, { transforms: { to: 'test.htm' } }, { output: 'htm' }));
        Pack.transforms.minify.apply(wrap(true, { transforms: { to: 'test.css' } }, { output: 'css' }));

        ok(Pack.api.MinifyJavascript.minify.calledWithExactly('js'));
        ok(Pack.api.MinifyMarkup.minify.calledWithExactly('htm'));
        ok(Pack.api.MinifyStylesheet.minify.calledWithExactly('css'));
    });
})();
(function () {
    QUnit.module("transforms.content", { setup: filesAsSpy });

    test("load calls getFileContents passing file names", function () {
        Pack.transforms.load.apply(wrap(true, {}, { files: new FileList('1', '3') }));
        ok(Pack.api.Files.getFileContents.calledOnce);
        deepEqual(Pack.api.Files.getFileContents.firstCall.args[0], ['1', '3']);
    });
    

    QUnit.module("transforms.output", { setup: filesAsSpy });

    test("combine joins all files contents", function () {
        var data = { files: new FileList({ path: 'file1', content: '1' }, { path: 'file2', content: '2' }, { path: 'file3', content: '3' }) };
        Pack.transforms.combine.apply(wrap(true, {}, data));
        equal(data.output, '123');
    });


    QUnit.module("transforms.finalise", { setup: filesAsSpy });

    test("write calls writeFile with correct arguments", function () {
        var output = new Pack.Output({ to: '../test.txt' }, 'C:\\temp\\');
        var data = { output: 'test' };
        Pack.transforms.to.apply(wrap(true, output, data));
        ok(Pack.api.Files.writeFile.calledOnce);
        ok(Pack.api.Files.writeFile.calledWithExactly('C:\\test.txt', 'test'));
    });
})();
(function () {
    QUnit.module("transforms.outputTemplate");

    test("outputTemplate renders underscore template", function () {
        var data = { output: '' };
        pack.templates = { 'template': 'templatecontent' };
        Pack.transforms.outputTemplate.apply(wrap('template', { transforms: { to: 'test' } }, data));

        equal(data.output, 'templatecontent');
    });

    test("outputTemplate renders multiple underscore templates", function () {
        var data = { output: '' };
        pack.templates = { 'template': 'templatecontent', 'template2': '<%=content%>2' };
        Pack.transforms.outputTemplate.apply(wrap(['template', 'template2'], { transforms: { to: 'test' } }, data));

        equal(data.output, 'templatecontent2');
    });

    test("outputTemplate renders passed data", function () {
        var data = { output: 'content' };
        pack.templates = { 'template': '<%=content%><%=data.value%>' };
        Pack.transforms.outputTemplate.apply(wrap({ name: 'template', data: { value: 'testValue' } }, { transforms: { to: 'test' } }, data));

        equal(data.output, 'contenttestValue');
    });
})();
(function () {
    QUnit.module("transforms.syncTo", { setup: filesAsSpy });

    var data = {
        files: {
            list: [
                { path: '/path/to1/file1', pathRelativeToInclude: 'to1/file1' },
                { path: '/path/to2/file2', pathRelativeToInclude: 'to2/file2' }
            ],
            paths: function () { }
        }
    };

    test("syncTo executes copyFile for each file in list", function () {
        Pack.transforms.syncTo.apply(wrap('target/path', new Pack.Output({}, 'path/'), data));
        ok(Pack.api.Files.copyFile.calledTwice);
        deepEqual(Pack.api.Files.copyFile.firstCall.args, ['/path/to1/file1', 'path/target/path/to1/file1']);
        deepEqual(Pack.api.Files.copyFile.secondCall.args, ['/path/to2/file2', 'path/target/path/to2/file2']);
    });

    test("syncTo handles absolute paths", function() {
        Pack.transforms.syncTo.apply(wrap('/target/path/', new Pack.Output({}, 'path/'), data));
        ok(Pack.api.Files.copyFile.calledTwice);
        deepEqual(Pack.api.Files.copyFile.firstCall.args, ['/path/to1/file1', 'path/target/path/to1/file1']);
        deepEqual(Pack.api.Files.copyFile.secondCall.args, ['/path/to2/file2', 'path/target/path/to2/file2']);
    });
})();
(function () {
    QUnit.module("transforms.template");

    test("template renders underscore template", function () {
        var data = { files: new FileList({ path: 'filepath', content: 'filecontent' }) };
        pack.templates = { 'template': 'templatecontent' };
        Pack.transforms.template.apply(wrap('template', {}, data));

        equal(data.files.list.length, 1);
        equal(data.files.list[0].content, 'templatecontent');
    });

    test("template renders multiple underscore templates", function () {
        var data = { files: new FileList({ path: 'filepath', content: 'filecontent' }) };
        pack.templates = { 'template': 'templatecontent', 'template2': '<%=content%>2' };
        Pack.transforms.template.apply(wrap(['template', 'template2'], {}, data));

        equal(data.files.list.length, 1);
        equal(data.files.list[0].content, 'templatecontent2');
    });

    test("template renders built-in data", function () {
        var output = { basePath: '/test/' };
        var data = { files: new FileList({ path: '/test/files/file', content: 'content', filespec: '/files/*.*', configPath: '/test/', pathRelativeToConfig: 'files/file', includePath: '/test/files/', pathRelativeToInclude: 'file' }) };
        pack.templates = { 'template': '<%=path%>|<%=content%>|<%=configPath%>|<%=pathRelativeToConfig%>|<%=includePath%>|<%=pathRelativeToInclude%>' };
        Pack.transforms.template.apply(wrap('template', output, data));

        equal(data.files.list.length, 1);
        equal(data.files.list[0].content, '/test/files/file|content|/test/|files/file|/test/files/|file');
    });

    test("template name can be specified with an object", function () {
        var data = { files: new FileList({ path: 'filepath', content: 'filecontent' }) };
        pack.templates = { 'template': 'templatecontent' };
        Pack.transforms.template.apply(wrap({ name: 'template' }, {}, data));

        equal(data.files.list.length, 1);
        equal(data.files.list[0].content, 'templatecontent');
    });

    test("data specified in include transform overrides data in template transform", function() {
        var data = { files: new FileList({ path: 'filepath', content: 'filecontent', template: { name: 'template', data: { additionalData: 'add1' } } }) };
        pack.templates = { 'template': '<%=data.additionalData%>' };
        Pack.transforms.template.apply(wrap({ name: 'template', data: { additionalData: 'add2' } }, {}, data));

        equal(data.files.list.length, 1);
        equal(data.files.list[0].content, 'add1');
    });

    test("Path objects can be used in templates", function () {
        var data = { files: new FileList({ path: 'path/file.txt', content: 'filecontent' }) };
        pack.templates = { 'template': '<%=path.withoutFilename()%>' };
        Pack.transforms.template.apply(wrap('template', {}, data));

        equal(data.files.list.length, 1);
        equal(data.files.list[0].content, 'path/');
    });

    test("When function is passed as template value, actual value is set from function evaluation", function () {
        expect(4);
        var output = {};
        var data = { files: new FileList({ path: 'filepath', content: 'filecontent' }) };
        pack.templates = { 'template': 'templatecontent' };
        Pack.transforms.template.apply(wrap(function(currentOutput, target) {
            equal(currentOutput, output);
            equal(target, data);
            return 'template';
        }, output, data));

        equal(data.files.list.length, 1);
        equal(data.files.list[0].content, 'templatecontent');
    });
})();
(function () {
    var t;
    
    QUnit.module("transforms", {
        setup: function () {
            t = new Pack.TransformRepository();
        }
    });

    test("transform function is called with correct arguments", function () {
        var spy = sinon.spy();
        t.add('name', 'event', spy);
        t.events = ['event'];
        t.applyTo(new Pack.Output({ name: 'test' }, 'path/config'));

        ok(spy.calledOnce);
        equal(spy.firstCall.args[0].value, 'test');
        equal(spy.firstCall.args[0].output.basePath, 'path/');
    });

    test("transform functions are executed in event order", function() {
        var spy = sinon.spy();
        t.add('transform1', 'event1', spy);
        t.add('transform2', 'event2', spy);
        t.events = ['event1', 'event2'];
        t.applyTo(new Pack.Output({ transform2: '2', transform1: '1' }));

        ok(spy.calledTwice);
        equal(spy.firstCall.args[0].value, '1');
        equal(spy.secondCall.args[0].value, '2');
    });

    test("transform functions are executed in order specified", function() {
        var spy = sinon.spy();
        t.add('transform1', 'event', spy);
        t.add('transform2', 'event', spy);
        t.events = ['event'];
        t.applyTo(new Pack.Output({ transform2: '2', transform1: '1' }));

        ok(spy.calledTwice);
        equal(spy.firstCall.args[0].value, '2');
        equal(spy.secondCall.args[0].value, '1');
    });

    test("defaultTransforms are executed before others in event", function () {
        var spy = sinon.spy();
        t.events = ['event1', 'event2'];
        t.add('transform1', 'event1', spy);
        t.add('transform2', 'event2', spy);
        t.add('default', 'event2', spy);
        t.defaultTransforms = { 'default': 'default' };
        t.applyTo(new Pack.Output({ transform1: '1', transform2: '2' }));

        ok(spy.calledThrice);
        equal(spy.firstCall.args[0].value, '1');
        equal(spy.secondCall.args[0].value, 'default');
        ok(spy.thirdCall.args[0].value, '2');
    });
})();
