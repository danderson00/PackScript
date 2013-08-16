using PackScript.Api.Interfaces;

namespace PackScript.Api.Zip
{
    public class ZipApi : IApi
    {
        public string Name { get { return "Zip"; } }

        public void archive(string to, string rootPath, string[] files)
        {
            Archive.Compress(to, rootPath, files);
        }

        //public void GZip(string to, string content)
        //{
            
        //}
    }
}
