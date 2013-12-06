// the assumption here is that the built file will be run as a node module and this variable won't be exposed globally
// the embedded stuff depends on this. probably should change how it works...
var instance = new Pack.Api();
    
if (typeof exports !== 'undefined') {
    if (typeof module !== 'undefined' && module.exports)
        exports = module.exports = instance;
} //else
    // this is necessary for the Windows console version that runs on Noesis.Javascript
    _.extend(this, instance);
