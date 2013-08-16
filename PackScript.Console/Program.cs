using System;
using System.Reflection;

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
