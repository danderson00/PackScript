using System;
using System.Linq;
using System.Threading;
using PackScript.Api.Log;

namespace PackScript.Api.Files
{
    public class Retry
    {
        private LogApi Log { get; set; }
        private int[] RetryWaits = new[] { 100, 500, 1000 };

        public Retry(LogApi log)
        {
            Log = log;
        }

        public void Action(string operation, string path, Action action)
        {
            for (int i = 0; i < RetryWaits.Count(); i++)
                try
                {
                    action();
                    return;
                }
                catch (Exception ex)
                {
                    LogException(operation, ex, path, i + 1);
                    Thread.Sleep(RetryWaits[i]);
                }
        }

        public T Func<T>(string operation, string path, Func<T> func)
        {
            for (int i = 0; i < RetryWaits.Count(); i++)
                try
                {
                    return func();
                }
                catch (Exception ex)
                {
                    LogException(operation, ex, path, i + 1);
                    Thread.Sleep(RetryWaits[i]);
                }
            return default(T);
        }

        private void LogException(string operation, Exception ex, string path, int i)
        {
            if (i == RetryWaits.Count())
            {
                var message = string.Format("Unable to {0} file after {1} attempts: {2} ({3})", operation, i, path, ex.Message);
                Log.error(message);
            }
        }
    }
}
