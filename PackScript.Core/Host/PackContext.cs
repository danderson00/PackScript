using System;
using PackScript.Api.Files;
using PackScript.Api.Log;
using PackScript.Api.Zip;

namespace PackScript.Core.Host
{
    public class PackContext : ApiContext<PackContext>
    {
        private LogApi Logger { get; set; }

        public PackContext(string path, LogApi logger)
        {
            Logger = logger;
            RegisterJavascript(GetType().Assembly);
            AddApi(new ContextData { rootPath = path.EndsWith("\\") ? path : path + "\\" });
        }

        public PackContext ScanForResources(string path = null)
        {
            path = string.IsNullOrEmpty(path)
                       ? "Context.rootPath"
                       : string.Format("\"{0}\"", path);
            try {
                Execute(string.Format("pack.scanForResources({0})", path));
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

        public PackContext SetOptions(string options)
        {
            try
            {
                Execute(string.Format("pack.setOptions({0})", options));
            }
            catch (Exception ex)
            {
                Logger.error(string.Format("An error occurred handling a file change: {0}", ex.Message));
            }
            return this;
        }

        public PackContext AddDefaultApis()
        {
            return AddApi(new FilesApi(Logger, new Retry(Logger)))
                  .AddApi(Logger)
                  .AddApi(new ZipApi());
        }
    }
}
