pack([
    '../PackScript.Core/Build/packscript.core.node.js',
    { files: 'Source/*.js', recursive: true }
]).to('Build/packscript.node.js');

pack([
    'Tests/*.js',
    '../PackScript.Tests/Core/tests.js'
]).to('Build/packscript.node.tests.js');