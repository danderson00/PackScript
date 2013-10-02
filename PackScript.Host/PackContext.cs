using System;
using Newtonsoft.Json;
using PackScript.Api.Files;
using PackScript.Api.Log;
using PackScript.Api.Zip;
using PackScript.Core.Build;

namespace PackScript.Host
{
    public class PackContext : ApiContext<PackContext>
    {
        private LogApi Logger { get; set; }
        public dynamic Options { get; set; }

        // options.directory and options.excludedDirectories must be set.
        // Perhaps this should be a class now instead of a dynamic object.
        public PackContext(dynamic options, LogApi logger)
        {
            Options = options;
            Logger = logger;
            RegisterJavascript(typeof(AssemblyHook).Assembly);
            AddApi(new ContextData { rootPath = EnsureTrailingSlash(Options.directory) });
            AddApi(logger);
            var serialised = JsonConvert.SerializeObject(options);
            Execute(string.Format("pack.setOptions({0})", serialised));
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

        public PackContext AddDefaultApis()
        {
            return AddApi(new FilesApi(Logger, new Retry(Logger), Options.excludedDirectories))
                  .AddApi(Logger)
                  .AddApi(new ZipApi());
        }

        private string EnsureTrailingSlash(string path)
        {
            return path.EndsWith("\\") ? path : path + "\\";
        }
    }
}
