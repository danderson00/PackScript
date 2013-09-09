using System;
using PackScript.Api.Interfaces;

namespace PackScript.Api.Log
{
    public class LogApi : IApi
    {
        public LogApi(ILogProvider provider, LogLevel level = LogLevel.Debug)
        {
            Provider = provider;
            this.level = level;
        }

        public string Name { get { return "Log"; } }
        private ILogProvider Provider { get; set; }

        public LogLevel level { get; set; }

        public void setLevel(string level)
        {
            LogLevel parsed;
            Enum.TryParse(level, true, out parsed);
            this.level = parsed;
        }

        public void debug(string message)
        {
            if(level <= LogLevel.Debug)
                Provider.Write(LogLevel.Debug, message);
        }

        public void info(string message)
        {
            if (level <= LogLevel.Info)
                Provider.Write(LogLevel.Info, message);
        }

        public void warn(string message)
        {
            if (level <= LogLevel.Warn)
                Provider.Write(LogLevel.Warn, message);
        }

        public void error(string message)
        {
            if (level <= LogLevel.Error)
                Provider.Write(LogLevel.Error, message);
        }
    }
}
