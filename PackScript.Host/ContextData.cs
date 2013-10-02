using PackScript.Api.Interfaces;

namespace PackScript.Host
{
    public class ContextData : IApi
    {
        public string Name { get { return "Context"; } }
        public string rootPath { get; set; }
    }
}
