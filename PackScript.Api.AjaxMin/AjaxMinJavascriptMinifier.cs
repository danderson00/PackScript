using Microsoft.Ajax.Utilities;
using PackScript.Api.Minify;

namespace PackScript.Api.AjaxMin
{
    public class AjaxMinJavascriptMinifier : IMinifyJavascript
    {
        public string Name { get { return "MinifyJavascript"; } }

        public string minify(string source)
        {
            return new Minifier().MinifyJavaScript(source, new CodeSettings { TermSemicolons = true, PreserveImportantComments = false });
        }
    }
}
