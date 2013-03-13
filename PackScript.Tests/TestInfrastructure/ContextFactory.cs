using System.Linq;
using PackScript.Api.Interfaces;
using PackScript.Api.Log;
using PackScript.Core.Infrastructure;
using Noesis.Javascript.Dynamic;

namespace PackScript.Tests.TestInfrastructure
{
    public static class ContextFactory
    {
        private static IApi[] DefaultApis = {};

        public static PackContext Create(string path, params IApi[] apis)
        {
            return new PackContext(path, new DebugLogApi()).LoadApis(apis);
        }

        private static PackContext LoadApis(this PackContext context, IApi[] apis)
        {
            context.AddDefaultApis();
            apis.ToList().ForEach(context.RegisterApi);
            return context;
        }
    }
}
