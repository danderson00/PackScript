using PackScript.Api.Log;

namespace PackScript.Tests.TestInfrastructure
{
    public class Log
    {
        public static LogApi Api { get { return new LogApi(new DebugLogProvider()); } }
    }
}
