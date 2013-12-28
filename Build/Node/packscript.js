var _ = require('underscore');

Pack = function(options) {
    this.outputs = [];
    this.templates = _.extend({}, Pack.templates);
    this.loadedConfigs = [];
    this.transforms = new Pack.TransformRepository(Pack.transforms);
    this.buildQueue = [];

    this.options = _.extend({
        configurationFileFilter: '*pack.config.js',
        packFileFilter: '*pack.js',
        templateFileExtension: '.template.*',
        logLevel: 'debug',
        throttleTimeout: 100
    }, options);
    
    if(Pack.api.Log) Pack.api.Log.setLevel(this.options.logLevel);
};

Pack.api = {};
Pack.templates = {};
Pack.transforms = {};
Pack.context = {};

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
};
Pack.Container = function() {
    this.files = new Pack.FileList();
    this.output = '';
};
Pack.TransformRepository = function (transforms) {
    var self = this;

    _.extend(this, transforms);

    this.events = ['includeFiles', 'excludeFiles', 'content', 'output', 'finalise'];
    this.defaultTransforms = { excludeDefaults: true, load: true, combine: true, template: true };
    
    this.add = function (name, event, func) {
        self[name] = { event: event, apply: func };
    };

    this.applyTo = function (output, pack) {
        return self.applyEventsTo(self.events, output, pack);
    };

    this.applyEventsTo = function(events, output, pack) {
        var target = new Pack.Container();
        var transforms = _.extend({}, self.defaultTransforms, output.transforms);
        _.each(events, function(event) {
            _.each(transforms, function(value, name) {
                if (self[name] && self[name].event === event)
                    self[name].apply({ value: value, output: output, target: target }, pack);
            });
        });
        return target;
    };
};
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
Pack.utils = {};

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
};
Pack.FileList = function() {
    var self = this;

    this.list = [];
    var hashed = {};

    function add(file) {
        file = mapToFileObject(file);
        if (!hashed[file.path]) {
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

    this.include = function(files) {
        if (files)
            Pack.utils.executeSingleOrArray(unwrapFileList(files), add);
        return this;
    };

    this.exclude = function(files) {
        if (files)
            Pack.utils.executeSingleOrArray(unwrapFileList(files), remove);
        return this;
    };

    this.filter = function(func, exclude) {
        _.each(self.paths(), function(path) {
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

    this.prioritise = function(filename, last) {
        // ouch... there has to be a better way to do this!
        var indexes = _.chain(self.list)
            .map(function(file, index) {
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
        return source.constructor === Pack.FileList ? source.list : source;
    }

    if (arguments.length > 0)
        self.include(_.toArray(arguments));
};

Pack.Output = function (transforms, configPath) {
    var self = this;
    
    this.configPath = configPath;
    this.basePath = Path(configPath).withoutFilename().toString();
    this.outputPath = Path(this.basePath + (transforms && transforms.to)).toString();
    this.transforms = transforms || {};
    
    // the currentPaths property is a cached list of file paths so we don't need to hit the filesystem 
    // for each call to matches. currentPaths gets set by finalise transforms to, zipTo and syncTo
    // the syncTo transform can also replace this function to override the default dehaviour
    this.getCurrentPaths = function(transformRepository) {
        return transformRepository.applyEventsTo(['includeFiles', 'excludeFiles'], self, { log: false }).files.paths();
    };
};

Pack.Output.prototype.matches = function (path, transformRepository, refresh) {
    if (refresh || !this.currentPaths)
        this.currentPaths = this.getCurrentPaths(transformRepository);
    
    return _.any(this.currentPaths, function(filePath) {
        return path === filePath;
    });
};

Pack.Output.prototype.targetPath = function () {
    return this.transforms.to ||
        this.transforms.zipTo ||
        this.transforms.syncTo;
};
(function () {
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
        Pack.context.configPath = path;
        Pack.utils.eval(source);
        delete Pack.context.configPath;
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

    Pack.prototype.build = function(outputs) {
        var self = this;

        if (!this.options.throttleTimeout)
            this.buildSync(outputs);
        else {
            // this should be separated and unit tested
            var timeout = this.options.throttleTimeout;
            this.buildQueue = _.union(this.buildQueue, outputs);

            if (this.buildQueue.length > 0) {
                if (this.buildTimeout)
                    clearTimeout(this.buildTimeout);

                this.buildTimeout = setTimeout(function() {
                    var queue = self.buildQueue;
                    self.buildQueue = [];
                    self.buildTimeout = undefined;
                    self.buildSync(queue);
                }, timeout);
            }
        }
        return this;
    };

    Pack.prototype.buildSync = function (outputs) {
        var self = this;

        Pack.utils.executeSingleOrArray(outputs, buildOutput);

        // if we are in watch mode, the file system watcher will handle recursion
        if (!this.options.watch) {
            // determine what files were written
            var outputPaths = _.isArray(outputs) ? _.pluck(outputs, 'outputPath') : outputs.outputPath;
            
            // build any outputs that match the written files
            var matchingOutputs = this.matchingOutputs(outputPaths);
            if (matchingOutputs.length > 0)
                this.build(matchingOutputs);
            return this;
        }

        function buildOutput(output) {
            return self.transforms.applyTo(output, self);
            //return output.build(self.transforms);
        }
    };

    Pack.prototype.executeTransform = function(name, output) {
        if (this.transforms[name])
            return this.transforms[name].apply(output.transforms[name], output);
    };    
})();

Pack.prototype.fileChanged = function (path, changeType) {
    var self = this;

    if (Path(path).match(this.options.configurationFileFilter) || Path(path).match(this.options.packFileFilter))
        handleConfigChange();
    else if (Path(path).match('*' + this.options.templateFileExtension))
        handleTemplateChange();
    else
        handleFileChange();

    function handleFileChange() {
        var refresh = changeType === 'create';
        self.build(self.matchingOutputs(path, refresh));
    }

    function handleConfigChange() {
        self.removeConfigOutputs(path);
        if (changeType !== 'delete') {
            self.loadConfig(path, Pack.api.Files.getFileContents([path])[path]);
            self.build(self.configOutputs(path));
        }
    }

    function handleTemplateChange() {
        if (changeType !== 'delete')
            self.loadTemplate(path);
    }
};

Pack.Api = function (packOptions) {
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
        var outputs = self.pack.addOutput(options, Pack.context.configPath);

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

Pack.transforms.combine = {
    event: 'output',
    apply: function(data, pack) {
        var target = data.target;
        var output = data.output;

        log();
        target.output = _.pluck(target.files.list, 'content').join('\n');

        function log() {
            Pack.api.Log.debug('(' + filenames() + ') -> ' + (output.transforms && output.transforms.to));
            if (target.files.list.length === 0 && output.transforms.include && !output.transforms.syncTo)
                Pack.api.Log.warn('No files to include for ' + (output.transforms && output.transforms.to));
        }

        function filenames() {
            return _.map(target.files.paths(), function(path) {
                return Path(path).filename();
            }).join(', ');
        }
    }
};


Pack.transforms.directory = {
    event: 'includeFiles',
    apply: function() {}
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
        apply: function(data, pack) {
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
        apply: function(data, pack) {
            Pack.api.Log.debug('Including ' + formatInclude(data.value, data.output) + ' in ' + data.output.targetPath());
            data.target.files.include(loadFileList(data.value, data.output));
        }
    };
    
    transforms.exclude = {
        event: 'excludeFiles',
        apply: function(data, pack) {
            Pack.api.Log.debug('Excluding ' + formatInclude(data.value, data.output) + ' from ' + data.output.targetPath());
            data.target.files.exclude(loadFileList(data.value, data.output));
        }
    };

    function loadFileList(allValues, output) {
        var Files = Pack.api.Files;
        var allFiles = new Pack.FileList();
        utils.executeSingleOrArray(allValues, includeValue);
        return allFiles;

        function includeValue(value) {
            allFiles.include(loadIndividualFileList(value));
        }

        function loadIndividualFileList(value) {
            var files = new Pack.FileList();

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
    apply: function(data, pack) {
        data.target.output = JSON.stringify(data.value);
    }
};
Pack.transforms.load = {
    event: 'content',
    apply: function(data, pack) {
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
    apply: function(data, pack) {
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
    apply: function(data, pack) {
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
                    content: '\n' + target.output,
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
    apply: function(data, pack) {
        var Files = Pack.api.Files,
            Log = Pack.api.Log,
            output = data.output;

        var targetFolder = Path(output.basePath + data.value + '/');
        var sourceDirectory = output.transforms.directory;
        
        if (sourceDirectory) {
            // sync an entire folder
            sourceDirectory = Path(output.basePath + sourceDirectory + '/').toString();
            Files.copy(sourceDirectory, targetFolder.toString());
            Log.info('Copied directory ' + sourceDirectory + ' to ' + targetFolder);

            output.getCurrentPaths = function() {
                // match the folder sync when any of the files change
                return Files.getFilenames(sourceDirectory + '/*.*', true);
            };
        } else {
            // copy included files
            var files = data.target.files.list;
            _.each(files, function(file) {
                Files.copy(file.path.toString(), targetFolder + file.pathRelativeToInclude);
            });
            Log.info('Copied ' + files.length + ' files to ' + targetFolder);

            // this is a bit nasty. It is consumed by Output.matches
            output.currentPaths = data.target.files && data.target.files.paths();
        }
    }
};

Pack.transforms.template = {
    event: 'content',
    apply: function(data, pack) {
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
                        content: '\n' + file.content,
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
};
Pack.transforms.to = {
    event: 'finalise',
    apply: function(data, pack) {
        var Files = Pack.api.Files;
        var Log = Pack.api.Log;
        var path = Path(data.output.basePath + data.output.transforms.to);
        Files.writeFile(path.toString(), data.target.output);
        Log.info('Wrote file ' + path);

        // this should be moved to a separate transform - consumed by Output.matches
        data.output.currentPaths = data.target.files && data.target.files.paths();
    }
};


Pack.transforms.zipTo = {
    event: 'finalise',
    apply: function(data, pack) {
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
}
T.mockjax = function (to, path) {
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
};
T.sourceUrlTag = function (path, domain, protocol) {
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
};
T.webTargets = function(path) {
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
};
T.scripts = function (pathOrOptions, debug) {
    var options = normaliseOptions(pathOrOptions, debug);
    return include(function(output) {
        return {
            name: (options.debug || output.transforms.debug) ? 'T.Script.debug' : 'T.Script',
            data: options
        };
    }, 'js', options);
};

T.resources = T.models = T.sagas = function(pathOrOptions, debug) {
    var options = normaliseOptions(pathOrOptions, debug);
    var template = function(output) {
        return [
            { name: 'T.Resource', data: options },
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
}
Pack.templates['Pack.embedTemplate'] = '\nPack.templates[\'<%=path.filename().toString().replace(".template.js", "")%>\'] = \'<%=T.embedString(content)%>\';\n';

Pack.templates['T.document'] = '\n<%= data.documentation(content) %>';

Pack.templates['T.mockjax.outer'] = '\n<%= content %>\n<%= data.mockGaps() %>';

Pack.templates['T.mockjax'] = '\n$.mockjax({\n    url: \'<%= pathRelativeToConfig %>\',\n    responseText: \'<%= T.embedString(content) %>\',\n    responseTime: 0\n});\n<% data.registerUrl(pathRelativeToConfig) %>';

Pack.templates['T.Resource'] = '\n<%=T.modelScriptEnvironment(pathRelativeToInclude, data.prefix)%>\n<%=content%>\n';

Pack.templates['T.Script.debug'] = '\nwindow.eval("<%= T.prepareForEval(content) + T.sourceUrlTag(pathRelativeToConfig, data.domain, data.protocol) %>");\n';

Pack.templates['T.Script'] = '\n// <%= pathRelativeToConfig %>\n<%= content %>\n';

Pack.templates['T.Style'] = '\n//<% if(!target.includesStylesheetHelper) { %>\nwindow.__appendStyle = function (content) {\n    var element = document.getElementById(\'__tribeStyles\');\n    if (!element) {\n        element = document.createElement(\'style\');\n        element.className = \'__tribe\';\n        element.id = \'__tribeStyles\';\n        document.getElementsByTagName(\'head\')[0].appendChild(element);\n    }\n\n    if(element.styleSheet)\n        element.styleSheet.cssText += content;\n    else\n        element.appendChild(document.createTextNode(content));\n};//<% target.includesStylesheetHelper = true; } %>\nwindow.__appendStyle(\'<%= api.MinifyStylesheet.minify(content).replace(/\\\'/g, "\\\\\'") %>\');';

Pack.templates['T.Template'] = '\n//<% if(!target.includesTemplateHelper) { %>\nwindow.__appendTemplate = function (content, id) {\n    var element = document.createElement(\'script\');\n    element.className = \'__tribe\';\n    element.setAttribute(\'type\', \'text/template\');\n    element.id = id;\n    element.text = content;\n    document.getElementsByTagName(\'head\')[0].appendChild(element);\n};//<% target.includesTemplateHelper = true; } %>\nwindow.__appendTemplate(\'<%=T.embedString(content)%>\', \'<%=T.templateIdentifier(pathRelativeToInclude, data.prefix)%>\');';

Pack.utils.listTree = function(filespec, recursive) {
    var fs = require('fs');

    filespec = Path(filespec);

    var filter = filespec.filename().toString() || '*.*';
    var basePath = filespec.withoutFilename().toString() || './';
    var paths = [];
    var childDirectories = [];

    try {
        var children = fs.readdirSync(basePath);

        children.forEach(function(child) {
            var fullChild = basePath + child;

            try {
                var stat = fs.statSync(fullChild);
                if (!stat.isDirectory() && Path(fullChild).match(filespec))
                    paths.push(fullChild);

                if (stat.isDirectory() && recursive && Pack.api.Files.excludedDirectories.indexOf(child) === -1)
                    childDirectories.push(fullChild);
            } catch(ex) {
                Pack.api.Log.warn('Unable to get file information for ' + fullChild);
            }
        });
    } catch(ex) {
        Pack.api.Log.warn('Unable to get directory contents from ' + basePath);
    }

    // we want to process child directories after the directory contents
    childDirectories.forEach(function(child) {
        paths.push.apply(paths, Pack.utils.listTree(child + '/' + filter, recursive));
    });

    return paths;
};

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
(function () {
    var fs = require('fs-extra');

    Pack.api.Files = {
        getFilenames: function (filespec, recursive) {
            return Pack.utils.listTree(filespec, recursive);
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
            try {
                return fs.writeFileSync(path, content);
            } catch(ex) {
                Pack.api.Log.error('Error writing to ' + path, ex);
            }
        },
        copy: function (from, to) {
            fs.mkdirpSync(Path(to).withoutFilename().toString());
            fs.copySync(from, to);
        },        
        excludedDirectories: ['csx', 'obj']
    };

    function readFile(path) {
        try {
            var content = fs.readFileSync(path, 'utf8');
            if (content.charCodeAt(0) == 65279)
                return content.substring(1);
            return content;
        } catch (ex) {
            Pack.api.Log.error('Error reading from ' + path, ex);
        }
    }
})();

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

Pack.api.MinifyJavascript = {
    minify: function (source) {
        var uglify = require('uglify-js');
        
        var ast = uglify.parse(source);
        ast.figure_out_scope();

        ast.compute_char_frequency();
        ast.mangle_names();
        
        var compressor = uglify.Compressor({ warnings: false });
        ast = ast.transform(compressor);
        
        return ast.print_to_string();
    }
};

Pack.api.MinifyStylesheet = {
    minify: function (source) {
        var options = {
            maxLineLen: 0,
            expandVars: false,
            uglyComments: true
        };
        var uglifycss = require('uglifycss');
        return uglifycss.processString(source, options);
    }
};
(function() {
    require('node-zip');
    var fs = require('fs');

    Pack.api.Zip = {
        archive: function(to, files) {
            var zip = new JSZip();
            
            for (var file in files)
                if (files.hasOwnProperty(file))
                    zip.file(file, Pack.api.Files.getFileContents(files[file]));
            
            fs.writeFileSync(to, zip.generate({ base64: false, compression: 'DEFLATE' }), 'binary');
        }
    };
})();
if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports)
        exports = module.exports = new Pack.Api();
}