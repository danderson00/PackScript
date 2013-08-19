// define our static pack function
var pack = function (transforms) {
    pack.addOutput(transforms, Context.configPath);
};

// extend the static function with an instance of Pack
// this seems to be the only way of getting the config API I want - pack({ ... }); and pack.outputs etc.
// the only way to have a function with extra properties is to extend a named function
_.extend(pack, new Pack());

function sync(options) {
    options.syncTo = options.to;
    delete options.to;
    pack(options);
}

function zip(options) {
    options.zipTo = options.to;
    delete options.to;
    pack(options);
}