using System;
using System.Collections.Generic;
using System.IO;
using System.Threading;
using Newtonsoft.Json;
using Noesis.Javascript.Console;
using PackScript.Api.AjaxMin;
using PackScript.Api.Files;
using PackScript.Api.Interfaces;
using PackScript.Api.Log;
using PackScript.Api.Sass;
using PackScript.Api.Xdt;
using PackScript.Api.Zip;
using PackScript.Core.Host;

namespace PackScript.Console
{
    class Builder
    {
        public static void Build(dynamic options)
        {
            var log = new LogApi(new ConsoleLogProvider());
            var context = new PackContext(options.directory, log)
                .RegisterJavascript(typeof(IApi).Assembly)
                .AddApi(new FilesApi(log, new Retry(log)))
                .AddApi(new ZipApi())
                .AddApi(new AjaxMinJavascriptMinifier())
                .AddApi(new AjaxMinStylesheetMinifier())
                .AddApi(new XdtApi(log))
                .AddApi(log);

            if (HasProperty(options, "RubyPath"))
                context.AddApi(new SassApi(options.RubyPath, log));

            if (HasProperty(options, "ResourcePath"))
                context.ScanForResources(options.ResourcePath);

            context
                .SetOptions(JsonConvert.SerializeObject(options))
                .ScanForResources()
                .BuildAll();

            if (options.watch)
            {
                WatchFolder(context, options.directory);
                SystemConsole.Attach(context.Context);
            }
        }

        private static void WatchFolder(PackContext context, string path)
        {
            System.Console.WriteLine("Watching {0}, enter JavaScript or a blank line to end.", Path.GetFullPath(path));

            var watcher = new FileSystemWatcher(path);
            watcher.IncludeSubdirectories = true;

            new Thread(() =>
            {
                while (true)
                {
                    // this is simple but not good enough - it misses changes that occur while a build is occurring
                    var change = watcher.WaitForChanged(WatcherChangeTypes.All);
                    var changedFilePath = Path.GetFullPath(Path.Combine(path, change.Name));
                    var oldFilePath = Path.GetFullPath(Path.Combine(path, change.OldName ?? change.Name));
                    context.FileChanged(changedFilePath, oldFilePath, change.ChangeType.ToStringChangeType());
                }
            }).Start();
        }

        public static bool HasProperty(object source, string name)
        {
            var dictionary = source as IDictionary<string, object>;
            return dictionary != null && dictionary.ContainsKey(name);
        }
    }
}
