$('head')
    .append('<script type="text/template" id="<%=T.templateIdentifier(pathRelativeToInclude, data.prefix)%>"><%=T.embedString(content)%></script>');
