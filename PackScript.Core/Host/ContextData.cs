using PackScript.Api.Interfaces;

namespace PackScript.Core.Host
{
    public class ContextData : IApi
    {
        public string Name { get { return "Context"; } }
        public string rootPath { get; set; }
    }
}
