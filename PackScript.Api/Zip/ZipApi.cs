using System;
using System.Collections.Generic;
using PackScript.Api.Log;

namespace PackScript.Api.Zip
{
    public class ZipApi : IZipApi
    {
        public string Name { get { return "Zip"; } }

        public LogApi Log { get; set; }

        public void archive(string to, Dictionary<string, object> files)
        {
            try
            {
                Archive.Compress(to, files);
            }
            catch (Exception ex)
            {
                Log.error(string.Format("Unable to create ZIP file {0}: {1}", to, ex.Message));
            }
        }

        //public void GZip(string to, string content)
        //{
            
        //}
    }
}
