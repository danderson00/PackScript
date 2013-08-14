$('<style/>')
    .attr('class', '__tribe')
    .text('<%= MinifyStylesheet.minify(content).replace(/\'/g, "\\'") %>')
    .appendTo('head');
