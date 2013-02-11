using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Reflection;

namespace PackScript.Console
{
    public static class AssemblyLoaderExtensions
    {
        public static Assembly[] LoadEmbeddedAssemblies(this Assembly assembly, string[] names)
        {
            return names.Select(x => LoadEmbeddedAssembly(assembly, x)).ToArray();
        }

        public static Assembly LoadEmbeddedAssembly(this Assembly assembly, string name)
        {
            var fullname = assembly.GetManifestResourceNames().First(x => AssemblyNameMatches(name, x));
            return Assembly.Load(LoadFromStream(assembly.GetManifestResourceStream(fullname)));
        }

        private static bool AssemblyNameMatches(string requestedName, string nameFromAssembly)
        {
            return nameFromAssembly.ToLower().EndsWith(requestedName.ToLower() + ".dll") ||
                nameFromAssembly.ToLower().EndsWith(requestedName.ToLower() + ".exe");
        }

        private static byte[] LoadFromStream(Stream stream)
        {
            byte[] content = new byte[stream.Length];
            stream.Read(content, 0, (int) stream.Length);
            return content;
        }
    }
}
