using System.Collections.Generic;
using System.Linq;
using PackScript.Api.Files;

namespace PackScript.Tests.TestInfrastructure
{
    internal class TestFilesApi : FilesApi
    {
        public List<Call<string, bool>> getFilenamesCalls { get; private set; }
        public List<Call<string[]>> getFileContentsCalls { get; private set; }
        public List<Call<string, string>> writeFileCalls { get; private set; }

        public TestFilesApi()
        {
            getFilenamesCalls = new List<Call<string, bool>>();
            getFileContentsCalls = new List<Call<string[]>>();
            writeFileCalls = new List<Call<string, string>>();
        }

        public string Output(string file)
        {
            return writeFileCalls.Last(x => x.FirstArg.EndsWith("/" + file) || x.FirstArg.EndsWith("\\" + file)).SecondArg;
        }

        #region Overrides

        public override string[] getFilenames(string filespec, bool recursive = false)
        {
            getFilenamesCalls.Add(Call.Create(filespec, recursive));
            return base.getFilenames(filespec, recursive);
        }

        public override Dictionary<string, string> getFileContents(string[] files)
        {
            getFileContentsCalls.Add(Call.Create(files));
            return base.getFileContents(files);
        }

        public override void writeFile(string path, string content)
        {
            writeFileCalls.Add(Call.Create(path, content));
        }

        #endregion
    }
}
