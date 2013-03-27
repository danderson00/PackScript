using System;
using System.Collections.Generic;
using System.IO;
using System.Threading;
using Noesis.Javascript.Console;
using PackScript.Api.AjaxMin;
using PackScript.Api.Files;
using PackScript.Api.Interfaces;
using PackScript.Api.Sass;
using PackScript.Core.Infrastructure;

namespace PackScript.Console
{
    class Builder
    {
        public static void Build(dynamic options)
        {
            var log = new ConsoleLogger();
            var context = new PackContext(options.Directory, log)
                .RegisterJavascript(typeof(IApi).Assembly)
                .AddApi(new FilesApi(new ConsoleLogger()))
                .AddApi(new AjaxMinJavascriptMinifier())
                .AddApi(new AjaxMinStylesheetMinifier())
                .AddApi(log);

            if (HasProperty(options, "RubyPath"))
                context.AddApi(new SassApi(options.RubyPath, log));

            context
                .ScanForResources()
                .BuildAll();

            if (options.Watch)
            {
                WatchFolder(context, options.Directory);
                SystemConsole.Attach(context.Context);
            }
        }

        private static void WatchFolder(PackContext context, string path)
        {
            System.Console.WriteLine("Watching {0}, enter JavaScript or a blank line to end.", path);

            var watcher = new FileSystemWatcher(path);
            watcher.IncludeSubdirectories = true;

            new Thread(() =>
            {
                while (true)
                {
                    // this is simple but not good enough - it misses changes that occur while a build is occurring
                    var change = watcher.WaitForChanged(WatcherChangeTypes.All);
                    var changedFilePath = Path.Combine(path, change.Name);
                    var oldFilePath = Path.Combine(path, change.OldName ?? change.Name);
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
