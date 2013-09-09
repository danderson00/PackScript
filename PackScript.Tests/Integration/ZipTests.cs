using System.Collections.Generic;
using System.IO;
using System.Linq;
using FluentAssertions;
using NSubstitute;
using NUnit.Framework;
using PackScript.Api.Zip;
using PackScript.Core.Host;
using PackScript.Tests.TestInfrastructure;

namespace PackScript.Tests.Integration
{
    // The dependency on invocation order here is nasty
    [TestFixture]
    public class ZipTests
    {
        private TestFilesApi api;
        private PackContext context;
        private IZipApi zip;

        [TestFixtureSetUp]
        public void Setup()
        {
            api = new TestFilesApi();
            zip = Substitute.For<IZipApi>();
            zip.Name.Returns("Zip");
            context = ContextFactory.Create(@"..\..\Integration\Zip", api, zip).ScanForResources().BuildAll();
        }

        [Test]
        public void Api_is_called()
        {
            zip.ReceivedWithAnyArgs(3).archive(null, null);
        }

        [Test]
        public void Simple()
        {
            var files = (Dictionary<string, object>)zip.ReceivedCalls().ElementAt(1).GetArguments()[1];
            files.Count.Should().Be(1);
            files.ElementAt(0).Key.Should().Be("test.js");
            files.ElementAt(0).Value.Should().Be(FullPath("test.js"));
        }

        [Test]
        public void Child()
        {
            var files = (Dictionary<string, object>)zip.ReceivedCalls().ElementAt(2).GetArguments()[1];
            files.Count.Should().Be(1);
            files.ElementAt(0).Key.Should().Be("test.js");
            files.ElementAt(0).Value.Should().Be(FullPath("Child\\test.js"));
        }

        [Test]
        public void Recursive()
        {
            var files = (Dictionary<string, object>)zip.ReceivedCalls().ElementAt(3).GetArguments()[1];
            files.Count.Should().Be(2);
            files.ElementAt(0).Key.Should().Be("test.js");
            files.ElementAt(0).Value.Should().Be(FullPath("test.js"));
            files.ElementAt(1).Key.Should().Be("Child/test.js");
            files.ElementAt(1).Value.Should().Be(FullPath("Child\\test.js"));
        }

        private string FullPath(string path)
        {
            return Path.GetFullPath(@"..\..\Integration\Zip\") + path;
        }
    }
}
