using PackScript.Api.Interfaces;

namespace PackScript.Api.Minify
{
    public interface IMinifyMarkup : IApi
    {
        string minify(string source);
    }
}
