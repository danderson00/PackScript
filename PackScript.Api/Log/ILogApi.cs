using PackScript.Api.Interfaces;

namespace PackScript.Api.Log
{
    public interface ILogApi : IApi
    {
        void debug(string message);
        void info(string message);
        void warn(string message);
        void error(string message);
    }
}
