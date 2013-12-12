using FluentAssertions;
using NUnit.Framework;
using PackScript.Host;
using PackScript.Tests.TestInfrastructure;

namespace PackScript.Tests.Integration
{
    [TestFixture]
    public class OutputTemplateTests
    {
        private TestFilesApi api;
        private PackContext context;

        [SetUp]
        public void Setup()
        {
            api = new TestFilesApi();
            context = ContextFactory.Create(@"..\..\Integration\OutputTemplate", api).ScanForResources().BuildAll();
        }

        [Test]
        public void OutputTemplate()
        {
            api.Output("outputTemplate").Should().Be("// license\r\nfunction");
        }
    }
}
