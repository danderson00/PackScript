//<% if(!target.includesStylesheetHelper) { %>
window.__appendStyle = function (content) {
    var element = document.getElementById('__tribeStyles');
    if (!element) {
        element = document.createElement('style');
        element.className = '__tribe';
        element.id = '__tribeStyles';
        document.getElementsByTagName('head')[0].appendChild(element);
    }

    if(element.styleSheet)
        element.styleSheet.cssText += content;
    else
        element.appendChild(document.createTextNode(content));
};//<% target.includesStylesheetHelper = true; } %>
window.__appendStyle('<%= MinifyStylesheet.minify(content).replace(/\'/g, "\\'") %>');