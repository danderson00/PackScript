using System;
using System.Linq;
using System.Collections.Generic;
using System.IO;
using System.Threading;
using PackScript.Api.Log;

namespace PackScript.Api.Files
{
    public class FilesApi : IFilesApi
    {
        public string Name { get { return "Files"; } }
        private ILogApi Log { get; set; }
        private int[] RetryWaits = new[] {100, 500, 1000};

        public FilesApi(ILogApi log)
        {
            Log = log;
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
            return files.ToDictionary(x => x, TryRead);
        }

        public virtual void writeFile(string path, string content)
        {
            TryWrite(path, content);
        }

        private string TryRead(string path)
        {
            for (int i = 0; i < RetryWaits.Count(); i++)
                try
                {
                    return File.ReadAllText(path);
                }
                catch (Exception ex)
                {
                    LogException("read", ex, path, i + 1);
                    Thread.Sleep(RetryWaits[i]);
                }
            return "";
        }

        private void TryWrite(string path, string content)
        {
            for (int i = 0; i < RetryWaits.Count(); i++)
                try
                {
                    using (var writer = File.CreateText(path))
                        writer.Write(content);
                    return;
                }
                catch (Exception ex)
                {
                    LogException("write", ex, path, i + 1);
                    Thread.Sleep(RetryWaits[i]);
                }
        }

        private void LogException(string operation, Exception ex, string path, int i)
        {
            if (i == RetryWaits.Count())
            {
                var message = string.Format("Unable to {0} file after {1} attempts: {2} ({3})", operation, i, path, ex.Message);
                Log.error(message);
            }
        }
    }
}
