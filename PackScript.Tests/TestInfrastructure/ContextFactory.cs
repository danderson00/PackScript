using System.Linq;
using PackScript.Api.Interfaces;
using PackScript.Api.Log;
using Noesis.Javascript.Dynamic;
using PackScript.Core.Host;

namespace PackScript.Tests.TestInfrastructure
{
    public static class ContextFactory
    {
        private static IApi[] DefaultApis = {};

        public static PackContext Create(string path, params IApi[] apis)
        {
            return new PackContext(path, Log.Api).LoadApis(apis);
        }

        private static PackContext LoadApis(this PackContext context, IApi[] apis)
        {
            context.AddDefaultApis();
            apis.ToList().ForEach(context.RegisterApi);
            return context;
        }
    }
}
