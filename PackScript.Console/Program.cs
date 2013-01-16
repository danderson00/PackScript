using System.Dynamic;
using System.IO;
using System.Threading;
using PackScript.Api.AjaxMin;
using PackScript.Api.Files;
using PackScript.Core.Infrastructure;
using Noesis.Javascript.Console;

namespace PackScript.Console
{
    class Program
    {
        static void Main(string[] args)
        {
            dynamic options = ParseArguments(args);
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
            System.Environment.Exit(0);
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
                    context.FileChanged(changedFilePath);
                }
            }).Start();

        }

        private static dynamic ParseArguments(string[] arguments)
        {
            dynamic options = new ExpandoObject();

            options.Watch = false;
            options.Directory = Directory.GetCurrentDirectory();

            foreach (string argument in arguments)
            {
                switch (argument.ToLower())
                {
                    case "/watch":
                        options.Watch = true;
                        break;
                    default:
                        options.Directory = StripQuotes(argument);
                        break;
                }
            }

            return options;
        }

        private static string StripQuotes(string source)
        {
            return source.Replace("\"", "");
        }
    }
}
