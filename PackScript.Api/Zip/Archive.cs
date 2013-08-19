using System.Collections.Generic;
using System.IO;
using ICSharpCode.SharpZipLib.Core;
using ICSharpCode.SharpZipLib.Zip;

namespace PackScript.Api.Zip
{
    public class Archive
    {
        public static void Compress(string to, IDictionary<string, object> files)
        {
            var fsOut = File.Create(to);
            var zipStream = new ZipOutputStream(fsOut);

            zipStream.SetLevel(3);
            zipStream.UseZip64 = UseZip64.Off;

            try
            {
                CompressFiles(zipStream, files);
            }
            finally
            {
                zipStream.IsStreamOwner = true;
                zipStream.Close();                
            }
        }

        private static void CompressFiles(ZipOutputStream zipStream, IDictionary<string, object> files)
        {
            foreach (var file in files)
            {
                FileInfo fi = new FileInfo(file.Value.ToString());

                var newEntry = new ZipEntry(ZipEntry.CleanName(file.Key))
                    {
                        DateTime = fi.LastWriteTime,
                        Size = fi.Length
                    };

                zipStream.PutNextEntry(newEntry);

                byte[] buffer = new byte[4096];
                using (FileStream streamReader = File.OpenRead(file.Value.ToString()))
                    StreamUtils.Copy(streamReader, zipStream, buffer);

                zipStream.CloseEntry();
            }
        }
    }
}
