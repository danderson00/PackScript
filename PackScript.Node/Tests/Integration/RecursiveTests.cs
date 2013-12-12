using System.IO;
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
            context = ContextFactory.Create(Path.GetFullPath(@"..\..\Integration\Recursive"), api).ScanForResources().BuildAll();
        }

        [Test]
        public void Recursive()
        {
            api.writeFileCalls.Count.Should().Be(6);
            api.Output("final").Should().Be("1.js2.js");
            api.Output("subfolder").Should().Be("3.js4.js");
        }

        [Test]
        public void FileChanged()
        {
            api.writeFileCalls.Count.Should().Be(6);
            context.FileChanged(Path.GetFullPath(@"..\..\Integration\Recursive\1.js"), Path.GetFullPath(@"..\..\Integration\Recursive\1.js"), "modify");
            api.writeFileCalls.Count.Should().Be(8);
        }

        [Test]
        public void FileChangedInParentFolder()
        {
            api.writeFileCalls.Count.Should().Be(6);
            context.FileChanged(Path.GetFullPath(@"..\..\Integration\Recursive\3.js"), Path.GetFullPath(@"..\..\Integration\Recursive\3.js"), "modify");
            api.writeFileCalls.Count.Should().Be(8);
        }
    }
}
