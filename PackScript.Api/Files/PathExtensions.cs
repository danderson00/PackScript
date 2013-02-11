using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading.Tasks;

namespace PackScript.Api.Files
{
    public static class PathExtensions
    {
        public static bool Matches(this string path, string pattern)
        {
            return PrepareExpression(pattern).Match(path.Replace("\\", "/")).Success;
        }

        private static Regex PrepareExpression(string pattern)
        {
            return new Regex("^" + pattern
                .Replace("\\", "/")
                .Replace(".", "\\.")
                .Replace("*", ".*")
                .Replace("?", ".") + "$");
        }
    }
}
