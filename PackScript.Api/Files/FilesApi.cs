using System;
using System.Linq;
using System.Collections.Generic;
using System.IO;
using PackScript.Api.Log;

namespace PackScript.Api.Files
{
    public class FilesApi : IFilesApi
    {
        public string Name { get { return "Files"; } }
        private ILogApi Log { get; set; }
        private Retry Retry { get; set; }

        public FilesApi(ILogApi log, Retry retry)
        {
            Log = log;
            Retry = retry;
        }

        public virtual string[] getFilenames(string filespec, bool recursive = false)
        {
            try
            {
                var options = recursive ? SearchOption.AllDirectories : SearchOption.TopDirectoryOnly;
                return Directory.GetFiles(Path.GetDirectoryName(filespec), Path.GetFileName(filespec), options)
                                .Where(x => x.Matches(filespec))
                                .Select(Path.GetFullPath)
                                .ToArray();
            }
            catch (Exception)
            {
                //Log.warn(string.Format("Couldn't retrieve file list for {0} - {1}", filespec, ex.Message));
                return new string[] {};
            }
        }

        public virtual Dictionary<string, string> getFileContents(string[] files)
        {
            return files.ToDictionary(x => x, Read);
        }

        public virtual void writeFile(string path, string content)
        {
            Write(path, content);
        }

        public virtual void copyFile(string from, string to)
        {
            Copy(from, to);
        }

        private string Read(string path)
        {
            return Retry.Func("read", path, () => File.ReadAllText(path));
        }

        private void Write(string path, string content)
        {
            Retry.Action("write", path, () =>
                {
                    using (var writer = File.CreateText(path))
                        writer.Write(content);
                });
        }

        private void Copy(string from, string to)
        {
            Retry.Action("copy", from, () =>
                {
                    Directory.CreateDirectory(Path.GetDirectoryName(to));
                    File.Copy(from, to, true);
                });
        }
    }
}
