using System;
using System.Collections.Generic;
using System.Configuration;
using System.Dynamic;
using System.IO;
using System.Linq;

namespace PackScript.Console
{
    public class OptionsProvider
    {
        public static dynamic Create(string[] arguments)
        {
            dynamic result = new ExpandoObject();
            ParseAppSettings(result);
            ParseArguments(arguments, result);
            return result;
        }

        private static void ParseAppSettings(IDictionary<string, Object> options)
        {
            var settings = ConfigurationManager.AppSettings;
            settings.AllKeys.ToList().ForEach(x => options.Add(x, settings[x]));
        }

        private static void ParseArguments(string[] arguments, dynamic options)
        {
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
        }

        private static string StripQuotes(string source)
        {
            return source.Replace("\"", "");
        }

    }
}
