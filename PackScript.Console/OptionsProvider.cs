using System;
using System.Collections.Generic;
using System.Configuration;
using System.Dynamic;
using System.IO;
using System.Linq;
using System.Text.RegularExpressions;

namespace PackScript.Console
{
    public class OptionsProvider
    {
        public static dynamic Create(string[] arguments)
        {
            IDictionary<string, Object> options = new ExpandoObject();

            options["watch"] = false;
            options["directory"] = Directory.GetCurrentDirectory();
            options["excludedDirectories"] = "csx;bin;obj";

            ParseAppSettings(options);
            ParseArguments(arguments, options);

            return options;
        }

        private static void ParseAppSettings(IDictionary<string, Object> options)
        {
            var settings = ConfigurationManager.AppSettings;
            settings.AllKeys.ToList().ForEach(x => options.Add(x, settings[x]));
        }

        private static void ParseArguments(string[] arguments, IDictionary<string, Object> options)
        {
            foreach (string argument in arguments)
                ParseArgument(argument, options);
        }

        private static void ParseArgument(string argument, IDictionary<string, Object> options)
        {
            var match = Regex.Match(argument, @"\/([^\:]+)[\:]*(.*)");
            if (match.Success)
                if (string.IsNullOrEmpty(match.Groups[2].Value))
                    options[match.Groups[1].Value] = true;
                else
                    options[match.Groups[1].Value] = match.Groups[2].Value;
            else
                options["directory"] = StripQuotes(argument);
        }

        private static string StripQuotes(string source)
        {
            return source.Replace("\"", "");
        }

    }
}
