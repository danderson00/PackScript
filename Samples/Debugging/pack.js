pack({
    to: 'Build/site.js',
    include: 'Source/*.js',
    prioritise: 'jquery.js',
    template: 'debug'
});

pack({
    to: 'Build/site.min.js',
    include: 'Source/*.js',
    prioritise: 'jquery.js',
    minify: true
});

pack({
    to: 'Build/site.css',
    include: 'Source/*.css'
});