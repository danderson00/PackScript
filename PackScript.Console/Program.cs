using System;
using System.Dynamic;
using System.IO;
using System.Reflection;
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
            AppDomain.CurrentDomain.AssemblyResolve += (sender, arg) =>
            {
                String resourceName = new AssemblyName(arg.Name).Name;
                return Assembly.GetEntryAssembly().LoadEmbeddedAssembly(resourceName);
            };

            Builder.Build(ParseArguments(args));
            System.Environment.Exit(0);
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
