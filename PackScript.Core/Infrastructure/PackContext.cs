using System;
using PackScript.Api.Files;
using PackScript.Api.Log;

namespace PackScript.Core.Infrastructure
{
    public class PackContext : ApiContext<PackContext>
    {
        private ILogApi Logger { get; set; }

        public PackContext(string path, ILogApi logger)
        {
            Logger = logger;
            RegisterJavascript(GetType().Assembly);
            AddApi(new ContextData { rootPath = path.EndsWith("\\") ? path : path + "\\" });
        }

        public PackContext ScanForResources()
        {
            try {
                Execute("pack.scanForResources(Context.rootPath)");
            } catch (Exception ex) {
                Logger.error(string.Format("An error occurred scanning for resources: {0}", ex.Message));
            }
            return this;
        }

        public PackContext BuildAll()
        {
            try {
                Execute("pack.all()");
            } catch (Exception ex) {
                Logger.error(string.Format("An error occurred building files: {0}", ex.Message));
            }
            return this;
        }

        public PackContext FileChanged(string path, string oldPath, string changeType)
        {
            try {
                Execute(string.Format("pack.fileChanged('{0}', '{1}', '{2}')", path.Replace("\\", "\\\\"), oldPath.Replace("\\", "\\\\"), changeType));
            } catch (Exception ex) {
                Logger.error(string.Format("An error occurred handling a file change: {0}", ex.Message));
            }
            return this;
        }

        public PackContext AddDefaultApis()
        {
            return AddApi(new FilesApi(new DebugLogApi()))
                  .AddApi(new DebugLogApi());
        }
    }
}
