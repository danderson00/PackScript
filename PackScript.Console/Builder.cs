using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using Noesis.Javascript.Console;
using PackScript.Api.AjaxMin;
using PackScript.Api.Files;
using PackScript.Core.Infrastructure;

namespace PackScript.Console
{
    class Builder
    {
        public static void Build(dynamic options)
        {
            var context = new PackContext(options.Directory)
                .AddApi(new FilesApi(new ConsoleLogger()))
                .AddApi(new AjaxMinJavascriptMinifier())
                .AddApi(new AjaxMinStylesheetMinifier())
                .AddApi(new ConsoleLogger())
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
                    var change = watcher.WaitForChanged(WatcherChangeTypes.All);
                    var changedFilePath = Path.Combine(path, change.Name);
                    var oldFilePath = Path.Combine(path, change.OldName ?? change.Name);
                    context.FileChanged(changedFilePath, oldFilePath, change.ChangeType.ToStringChangeType());
                }
            }).Start();
        }

    }
}
