using System.Collections.Generic;
using PackScript.Api.Interfaces;

namespace PackScript.Api.Zip
{
    public interface IZipApi : IApi
    {
        void archive(string to, Dictionary<string, object> files);
        //void GZip(string to, string content);
    }
}
