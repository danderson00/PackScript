using Microsoft.Ajax.Utilities;
using PackScript.Api.Minify;

namespace PackScript.Api.AjaxMin
{
    public class AjaxMinStylesheetMinifier : IMinifyStylesheet
    {
        public string Name { get { return "MinifyStylesheet"; } }

        public string minify(string source)
        {
            return new Minifier().MinifyStyleSheet(source, new CssSettings { TermSemicolons = false, CommentMode = CssComment.None, });
        }
    }
}
