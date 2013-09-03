(function () {
    var moduleFunction = module;
    module = function(name, lifecycle) {
        return moduleFunction('<%=data.prefix%>.' + name, lifecycle);
    };
    
<%=content%>
        
    module = moduleFunction;
})();