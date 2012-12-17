using PackScript.Api.Interfaces;

namespace PackScript.Api.Minify
{
    public interface IMinifyStylesheet : IApi
    {
        string minify(string source);
    }
}
