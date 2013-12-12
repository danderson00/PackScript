using FluentAssertions;
using NUnit.Framework;
using PackScript.Host;
using PackScript.Tests.TestInfrastructure;

namespace PackScript.Tests.Integration
{
    [TestFixture]
    public class ExcludedDirectoriesTests
    {
        private TestFilesApi api;
        private PackContext context;

        [SetUp]
        public void Setup()
        {
            api = new TestFilesApi("excluded");
            context = ContextFactory.Create(@"..\..\Integration\ExcludedDirectories", api).ScanForResources().BuildAll();
        }

        [Test]
        public void Configuration_files_in_excluded_directories_are_not_parsed()
        {
            api.OutputExists("excluded").Should().BeFalse();
        }
    }
}
