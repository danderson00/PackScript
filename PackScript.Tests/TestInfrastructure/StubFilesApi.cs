using System.Collections.Generic;
using System.Linq;
using PackScript.Api.Files;

namespace PackScript.Tests.TestInfrastructure
{
    internal class StubFilesApi : IFilesApi
    {
        public StubFilesApi()
        {
            Files = new Dictionary<string, string>();
            Writes = new List<KeyValuePair<string, string>>();
        }

        public string Name { get { return "Files"; } }

        public Dictionary<string, string> Files { get; set; }
        public List<KeyValuePair<string, string>> Writes { get; set; }

        public string[] getFilenames(string filespec, bool recursive = false)
        {
            return Files.Keys.ToArray();
        }

        public Dictionary<string, string> getFileContents(string[] files)
        {
            return Files.Where(x => files.Contains(x.Key)).ToDictionary(x => x.Key, x => x.Value);
        }

        public void writeFile(string path, string content)
        {
            Writes.Add(new KeyValuePair<string, string>(path, content));
        }
    }
}
