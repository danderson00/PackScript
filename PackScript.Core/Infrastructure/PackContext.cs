using PackScript.Api.Files;
using PackScript.Api.Log;

namespace PackScript.Core.Infrastructure
{
    public class PackContext : ApiContext<PackContext>
    {
        public PackContext(string path)
        {
            RegisterJavascript(GetType().Assembly);
            AddApi(new ContextData { rootPath = path.EndsWith("\\") ? path : path + "\\" });
        }

        public PackContext ScanForResources()
        {
            Execute("pack.scanForResources(Context.rootPath)");
            return this;
        }

        public PackContext BuildAll()
        {
            Execute("pack.all()");
            return this;
        }

        public PackContext FileChanged(string path, string oldPath, string changeType)
        {
            Execute(string.Format("pack.fileChanged('{0}', '{1}', '{2}')", path.Replace("\\", "\\\\"), oldPath.Replace("\\", "\\\\"), changeType));
            return this;
        }

        public PackContext AddDefaultApis()
        {
            return AddApi(new FilesApi(new DebugLogApi()))
                  .AddApi(new DebugLogApi());
        }
    }
}
