function FileList() {
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
}