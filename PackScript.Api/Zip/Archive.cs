using System.IO;
using ICSharpCode.SharpZipLib.Core;
using ICSharpCode.SharpZipLib.Zip;

namespace PackScript.Api.Zip
{
    public class Archive
    {
        public static void Compress(string to, string rootPath, string[] files)
        {
            var fsOut = File.Create(to);
            var zipStream = new ZipOutputStream(fsOut);

            zipStream.SetLevel(3);
            zipStream.UseZip64 = UseZip64.Off;

            CompressFiles(files, zipStream, rootPath);

            zipStream.IsStreamOwner = true;
            zipStream.Close();
        }

        private static void CompressFiles(string[] files, ZipOutputStream zipStream, string rootPath)
        {
            foreach (string filename in files)
            {
                FileInfo fi = new FileInfo(filename);

                string entryName = string.IsNullOrEmpty(rootPath) ? filename : filename.Replace(rootPath, "");
                ZipEntry newEntry = new ZipEntry(ZipEntry.CleanName(entryName));
                newEntry.DateTime = fi.LastWriteTime;
                newEntry.Size = fi.Length;

                zipStream.PutNextEntry(newEntry);

                byte[] buffer = new byte[4096];
                using (FileStream streamReader = File.OpenRead(filename))
                    StreamUtils.Copy(streamReader, zipStream, buffer);

                zipStream.CloseEntry();
            }
        }
    }
}
