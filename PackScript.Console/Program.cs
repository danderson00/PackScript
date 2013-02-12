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

            Builder.Build(OptionsProvider.Create(args));
            System.Environment.Exit(0);
        }
    }
}
