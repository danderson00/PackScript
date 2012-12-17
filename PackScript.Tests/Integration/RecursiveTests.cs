using FluentAssertions;
using NUnit.Framework;
using PackScript.Tests.TestInfrastructure;

namespace PackScript.Tests.Integration
{
    [TestFixture]
    public class RecursiveTests
    {
        private TestFilesApi api;
        private dynamic context;

        [SetUp]
        public void Setup()
        {
            api = new TestFilesApi();
            context = ContextFactory.Create(@"..\..\Integration\Recursive", api).ScanForResources().BuildAll();
        }

        [Test]
        public void Recursive()
        {
            api.Output("final").Should().Be("1.js2.js");
        }

        [Test]
        public void FileChanged()
        {
            context.FileChanged(@"..\..\Integration\Recursive\1.js");
            api.writeFileCalls.Count.Should().Be(5);
        }
    }
}
