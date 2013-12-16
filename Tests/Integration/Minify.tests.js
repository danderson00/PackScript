integrationTest('Minify', function(output) {
    output('javascript.js').equals('function name(n){var r=n;return r}');
    //output('markup.htm').equals('<html>\r\n    <body></body>\r\n</html>');
    output('stylesheet.css').equals('.class{display:none}');
});
