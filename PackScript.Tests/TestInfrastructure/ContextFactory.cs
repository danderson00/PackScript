using System.Dynamic;
using System.Linq;
using PackScript.Api.Interfaces;
using PackScript.Host;

namespace PackScript.Tests.TestInfrastructure
{
    public static class ContextFactory
    {
        private static IApi[] DefaultApis = {};

        public static PackContext Create(string path, params IApi[] apis)
        {
            dynamic options = new ExpandoObject();
            options.directory = path;
            options.excludedDirectories = "excluded";
            return new PackContext(options, Log.Api).LoadApis(apis);
        }

        private static PackContext LoadApis(this PackContext context, IApi[] apis)
        {
            context.AddDefaultApis();
            apis.ToList().ForEach(context.RegisterApi);
            return context;
        }
    }
}
