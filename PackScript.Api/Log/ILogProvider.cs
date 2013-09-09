namespace PackScript.Api.Log
{
    public interface ILogProvider
    {
        void Write(LogLevel level, string message);
    }
}
