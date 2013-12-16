$.mockjax({
    url: '<%= pathRelativeToConfig %>',
    responseText: '<%= T.embedString(content) %>',
    responseTime: 0
});
<% data.registerUrl(pathRelativeToConfig) %>