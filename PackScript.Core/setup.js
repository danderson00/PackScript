var pack = function (transforms) {
    pack.addOutput(transforms, Context.configPath);
};

// this seems to be the only way of getting the config API I want - pack({ ... }); and pack.outputs etc.
// the only way to have a function with extra properties is to extend a named function
_.extend(pack, new Pack());
