using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PackScript.Api.Log
{
    public class DebugLogApi : ILogApi
    {
        public string Name { get { return "Log"; } }

        public void debug(string message)
        {
            Debug.WriteLine(string.Format("DEBUG: {0}", message));
        }

        public void info(string message)
        {
            Debug.WriteLine(string.Format("INFO: {0}", message));
        }

        public void warn(string message)
        {
            Debug.WriteLine(string.Format("WARN: {0}", message));
        }

        public void error(string message)
        {
            Debug.WriteLine(string.Format("ERROR: {0}", message));
        }
    }
}
