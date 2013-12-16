
require('./packscript.js');
var sinon = require('sinon');
var _ = require('underscore');
_.extend(global, new Pack.Api({ throttleTimeout: 0 }));
var originalFiles = Pack.api.Files;

var originalMinifyJavascript = Pack.api.MinifyJavascript;
var originalMinifyStylesheet = Pack.api.MinifyStylesheet;
var originalMinifyMarkup = Pack.api.MinifyMarkup;
