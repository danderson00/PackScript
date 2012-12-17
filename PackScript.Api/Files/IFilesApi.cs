using System.Collections.Generic;
using PackScript.Api.Interfaces;

namespace PackScript.Api.Files
{
    public interface IFilesApi : IApi
    {
        string[] getFilenames(string filespec, bool recursive = false);
        Dictionary<string, string> getFileContents(string[] files);
        void writeFile(string path, string content);
    }
}
