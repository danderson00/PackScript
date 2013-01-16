PackScript
==========

PackScript is a powerful open source (MIT license) resource build system that combines and minifies your Javascript, HTML and CSS files based on Javascript configuration files.

For an introduction to PackScript and worked example, check out http://danderson00.blogspot.com.au/2013/01/packscript-next-generation-build-for-web.html.

Command Line Usage
==================

PackScript.exe [/watch] <target_folder>

PackScript will scan the target folder recursively for files matching the configurationFileFilter and packFileFilter options and execute them, configuration files first. 
Templates are also loaded from files with the extension specified in the templateFileExtension option.

/watch will cause PackScript to monitor the target folder for changes and update outputs as necessary. The console will also become an interactive JavaScript console.


Main Configuration API
======================
pack({
	to: 'path/filename.ext',
	include: 'filespec' || {
		files: 'filespec',
		recursive: true/false,
		template:'template name' || { name: 'template name', data: { value: 'passedToTemplate' } },
		prioritise: 'filename.ext'
	} || [],
	exclude: 'filespec' || {
		files: 'filespec',
		recursive: true/false
	} || [],
	template: 'template name' || { name: 'template name', data: { value: 'passedToTemplate' } },
	recursive: true/false,
	prioritise: 'filename.ext' || [],
	minify: true/false
});


Configuration Options
=====================
Pack.options = {
    configurationFileFilter: '*pack.config.js',
    packFileFilter: '*pack.js',
    templateFileExtension: '.template.*',
    logLevel: 'debug'
};


Default Template Data
=====================
{
	path: 'full/path/to/source/file.ext',
	content: 'file content',
	configPath: 'full/path/to/pack.js',
	pathRelativeToConfig: 'source/file.ext',
	includePath: 'full/path/to/source/',
	pathRelativeToInclude: 'file.ext'
}


Path Methods
============

Path objects are objects containing a set of methods for manipulation of paths. They are created as follows:

Path(inputPath) =
{
	filename: function() { },
	withoutFilename: function() { },
	extension: function() { },
	withoutExtension: function() { },
	isAbsolute: function() { },
	match: function(spec) { },
	asMarkupIdentifier: function () { }
}
