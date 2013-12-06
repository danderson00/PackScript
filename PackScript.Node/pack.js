pack([
    '../PackScript.Core/Build/packscript.core.node.js',
    { files: 'Source/*.js', recursive: true }
]).to('Build/packscript.js');

pack([
    'Build/packscript.js',
    { files: 'Tests/*.js', first: 'setup.js' },
    '../PackScript.Tests/Core/tests.js'
]).to('Build/packscript.tests.js');

sync('Build/*.*').to('node_modules/packscript');