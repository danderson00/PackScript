namespace PackScript.Api.Log
{
    public class DebugLogProvider : ILogProvider
    {
        public void Write(LogLevel level, string message)
        {
            System.Diagnostics.Debug.WriteLine("{0}: {1}", level.ToString().ToUpper(), message);
        }
    }
}
