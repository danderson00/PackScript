//<% if(!target.includesTemplateHelper) { %>
window.__appendTemplate = function (content, id) {
    var element = document.createElement('script');
    element.className = '__tribe';
    element.setAttribute('type', 'text/template');
    element.id = id;
    element.text = content;
    document.getElementsByTagName('head')[0].appendChild(element);
};//<% target.includesTemplateHelper = true; } %>
window.__appendTemplate('<%=T.embedString(content)%>', '<%=T.templateIdentifier(pathRelativeToInclude, data.prefix)%>');