using System;
using System.Linq;
using System.Collections.Generic;
using System.IO;

namespace PackScript.Api.Files
{
    public class FilesApi : IFilesApi
    {
        public string Name { get { return "Files"; } }

        public virtual string[] getFilenames(string filespec, bool recursive = false)
        {
            return Directory.GetFiles(Path.GetDirectoryName(filespec), Path.GetFileName(filespec),
                          recursive
                              ? SearchOption.AllDirectories
                              : SearchOption.TopDirectoryOnly);
        }

        public virtual Dictionary<string, string> getFileContents(string[] files)
        {
            return files.ToDictionary(x => x, File.ReadAllText);
        }

        public virtual void writeFile(string path, string content)
        {
            using(var writer = File.CreateText(path))
                writer.Write(content);
        }
    }
}
