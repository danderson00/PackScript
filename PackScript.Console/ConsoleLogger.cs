using System;
using System.Linq;
using PackScript.Api.Log;

namespace PackScript.Console
{
    public class ConsoleLogger : ILogApi
    {
        public string Name { get { return "Log"; } }

        public void debug(string message)
        {
            System.Console.ForegroundColor = ConsoleColor.Gray;
            Write(message, false);
        }

        public void info(string message)
        {
            System.Console.ForegroundColor = ConsoleColor.White;
            Write(message, false);
            System.Console.ForegroundColor = ConsoleColor.Gray;
        }

        public void warn(string message)
        {
            System.Console.ForegroundColor = ConsoleColor.Yellow;
            Write(message, false);
            System.Console.ForegroundColor = ConsoleColor.Gray;
        }

        public void error(string message)
        {
            System.Console.ForegroundColor = ConsoleColor.Red;
            Write(message, true);
            System.Console.ForegroundColor = ConsoleColor.Gray;
        }
        
        private void Write(string message, bool error)
        {
            var output = string.Format("{0} {1} {2}", DateTime.Now.ToShortDateString(), DateTime.Now.ToShortTimeString(), SanitiseMessage(message));
            if (error)
                System.Console.Error.WriteLine(output);
            else
                System.Console.WriteLine(output);
        }

        // bodgy workaround for ajaxmin error messages involving braces
        private string SanitiseMessage(string message)
        {
            if (string.IsNullOrEmpty(message))
                return "";

            var left = message.Count(x => x == '{');
            var right = message.Count(x => x == '}');

            if ((right == 1 && left == 0) || (right == 0 && left == 1))
                return message.Replace("{", "{{").Replace("}", "}}");

            return message;
        }
    }
}