PackScript
==========

PackScript is a powerful open source (MIT license) resource build system that combines and minifies your Javascript, HTML and CSS files based on Javascript configuration files.

For an introduction to PackScript and worked example, check out http://danderson00.blogspot.com.au/2013/01/packscript-next-generation-build-for-web.html.

A version with embedded dependencies (except for Noesis.Javascript.dll) can be found in the Build folder. 
Older versions of Windows may also require msvcp100.dll and msvcr100.dll from the Dependencies folder.

You can see the core unit tests at http://danderson00.github.com/PackScript/PackScript.Tests/Core/Resources/runner.htm.

Sass integration is currently external and requires [Ruby](http://rubyinstaller.org/downloads/) and [Sass](http://sass-lang.com/). Set the RubyPath AppSetting to the Ruby bin folder to enable integration. An internal implementation based on IronRuby will be provided soon.

Command Line Usage
==================

PackScript.exe [/watch] <"target_folder">

PackScript will scan the target folder recursively for files matching the configurationFileFilter and packFileFilter options and execute them, configuration files first. 
Templates are also loaded from files with the extension specified in the templateFileExtension option.

/watch will cause PackScript to monitor the target folder for changes and update outputs as necessary. The console will also become an interactive JavaScript console.


Main Configuration API
======================
<pre>
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
	minify: true/false,
	sass: true/false
});
</pre>


Configuration Options
=====================
<pre>
Pack.options = {
    configurationFileFilter: '*pack.config.js',
    packFileFilter: '*pack.js',
    templateFileExtension: '.template.*',
    logLevel: 'debug'
};
</pre>


Default Template Data
=====================
<pre>
{
	path: 'full/path/to/source/file.ext',
	content: 'file content',
	configPath: 'full/path/to/pack.js',
	pathRelativeToConfig: 'source/file.ext',
	includePath: 'full/path/to/source/',
	pathRelativeToInclude: 'file.ext'
}
</pre>


Path Methods
============

Path objects are objects containing a set of methods for manipulation of paths. They are created as follows:

<pre>
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
</pre>