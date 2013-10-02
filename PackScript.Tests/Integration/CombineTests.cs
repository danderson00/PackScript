using FluentAssertions;
using NUnit.Framework;
using PackScript.Host;
using PackScript.Tests.TestInfrastructure;

namespace PackScript.Tests.Integration
{
    [TestFixture]
    public class CombineTests
    {
        private TestFilesApi api;
        private PackContext context;

        [SetUp]
        public void Setup()
        {
            api = new TestFilesApi();
            context = ContextFactory.Create(@"..\..\Integration\Combine", api).ScanForResources().BuildAll();
        }

        [Test]
        public void Nonrecursive()
        {
            api.Output("nonrecursive").Should().Be("root.jsroot.txt");
        }

        [Test]
        public void Recursive()
        {
            api.Output("recursive").Should().Be("root.jsroot.txtsubfolder.jssubfolder.txt");
        }

        [Test]
        public void Individual_includes()
        {
            api.Output("individualIncludes").Should().Be("root.jssubfolder.jsroot.txt");
        }

        [Test]
        public void Subfolder()
        {
            api.Output("subfolder").Should().Be("subfolder.jssubfolder.txt");
        }

        [Test]
        public void Excludes()
        {
            api.Output("excludes").Should().Be("root.jssubfolder.js");
        }

        [Test]
        public void Simple_prioritise()
        {
            api.Output("simplePrioritise").Should().Be("root.txtroot.js");
        }

        [Test]
        public void Prioritise()
        {
            api.Output("prioritise").Should().Be("root.txtsubfolder.txtroot.jssubfolder.js");
        }

        [Test]
        public void Last()
        {
            api.Output("last").Should().Be("root.jssubfolder.jsroot.txtsubfolder.txt");
        }

        [Test]
        public void Multiple()
        {
            api.Output("multiple1").Should().Be("root.jsroot.txt");
            api.Output("multiple2").Should().Be("root.txtroot.js");
        }

        [Test]
        public void Alternate_syntax()
        {
            api.Output("alternate").Should().Be("root.jsroot.txt");
        }

        [Test]
        public void Alternate_syntax_with_array()
        {
            api.Output("alternateArray").Should().Be("root.jssubfolder.js");
        }
    }
}
