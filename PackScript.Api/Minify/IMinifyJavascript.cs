using PackScript.Api.Interfaces;
namespace PackScript.Api.Minify
{
    public interface IMinifyJavascript : IApi
    {
        string minify(string source);
    }
}
