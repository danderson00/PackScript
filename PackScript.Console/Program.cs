using System.Dynamic;
using System.IO;
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
                .AddDefaultApis()
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
            var watcher = new FileSystemWatcher(path);
            watcher.Changed += (sender, args) =>
                                   {
                                       context.FileChanged(args.FullPath);
                                   };
            watcher.IncludeSubdirectories = true;
            watcher.EnableRaisingEvents = true;
            System.Console.WriteLine("Watching {0}, enter JavaScript or a blank line to end.", path);
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
                        options.Directory = argument;
                        break;
                }
            }

            return options;
        }

    }
}
