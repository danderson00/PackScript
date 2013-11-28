using FluentAssertions;
using NUnit.Framework;
using PackScript.Host;
using PackScript.Tests.TestInfrastructure;

namespace PackScript.Tests.Integration
{
    [TestFixture]
    public class JsonTests
    {
        private TestFilesApi api;
        private PackContext context;

        [SetUp]
        public void Setup()
        {
            api = new TestFilesApi();
            context = ContextFactory.Create(@"..\..\Integration\Json", api).ScanForResources().BuildAll();
        }

        [Test]
        public void Json_transform_renders_stringified_object()
        {
            api.Output("json").Should().Be(@"{""string"":""test"",""number"":2.2,""bool"":true}");
        }
    }
}
