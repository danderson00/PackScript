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