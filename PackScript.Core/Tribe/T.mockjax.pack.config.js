T.mockjax = function (to, path) {
    var panes = {};
    
    var template = {
        name: 'T.mockjax',
        data: {
            registerUrl: registerUrl
        }
    };

    var outputTemplate = {
        name: 'T.mockjax.outer',
        data: {
            mockGaps: mockGaps
        }
    };

    return {
        to: to,
        include: path + '/*.*',
        recursive: true,
        template: template,
        outputTemplate: outputTemplate
    };


    function registerUrl(url) {
        var pane = Path(url).withoutExtension().toString();
        panes[pane] = panes[pane] || {};
        panes[pane][Path(url).extension().toString()] = true;
    }
    
    function mockGaps() {        
        return _.reduce(panes, function (output, extensions, pane) {
            var mocks = '';
            if (!extensions.js) mocks += mock404(pane + '.js');
            if (!extensions.htm) mocks += mock404(pane + '.htm');
            if (!extensions.css) mocks += mock404(pane + '.css');
            return output + mocks;
        }, '');
    }
    
    function mock404(url) {
        return "$.mockjax({ url: '" + url + "', status: 404, responseTime: 0 });\n";
    }
};