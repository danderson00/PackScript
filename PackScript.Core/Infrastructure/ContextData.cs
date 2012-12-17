using PackScript.Api.Interfaces;

namespace PackScript.Core.Infrastructure
{
    public class ContextData : IApi
    {
        public string Name { get { return "Context"; } }
        public string rootPath { get; set; }
    }
}
