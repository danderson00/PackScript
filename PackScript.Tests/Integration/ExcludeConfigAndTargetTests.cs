using FluentAssertions;
using NUnit.Framework;
using PackScript.Core.Infrastructure;
using PackScript.Tests.TestInfrastructure;

namespace PackScript.Tests.Integration
{
    [TestFixture]
    public class ExcludeConfigAndTargetTests
    {
        private TestFilesApi api;
        private PackContext context;

        [SetUp]
        public void Setup()
        {
            api = new TestFilesApi();
            context = ContextFactory.Create(@"..\..\Integration\ExcludeConfigAndTarget", api).ScanForResources().BuildAll();
        }

        [Test]
        public void Combine_excludes_config_file_and_output_file()
        {
            api.Output("output.js").Should().Be("root.js");
        }
    }
}
