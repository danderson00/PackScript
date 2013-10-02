using System.IO;
using FluentAssertions;
using NUnit.Framework;
using PackScript.Api.Sass;
using PackScript.Host;
using PackScript.Tests.TestInfrastructure;

namespace PackScript.Tests.Integration
{
    [TestFixture]
    public class SassTests
    {
        private TestFilesApi api;
        private PackContext context;
        private string rubyPath = @"C:\Ruby193\bin\";

        [SetUp]
        public void Setup()
        {
            if(!File.Exists(rubyPath + "ruby.exe"))
                Assert.Inconclusive("Can't find ruby.exe");

            api = new TestFilesApi();
            context = ContextFactory.Create(@"..\..\Integration\Sass", api, new SassApi(rubyPath, Log.Api)).ScanForResources().BuildAll();
        }

        [Test]
        public void Scss_file_is_compiled()
        {
            api.Output("compiled").Should().Be(".test {\r\n  color: white; }\r\n");
        }
    }
}
