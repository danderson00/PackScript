using System.IO;
using System.Linq;
using FluentAssertions;
using NUnit.Framework;
using PackScript.Core.Infrastructure;
using PackScript.Tests.TestInfrastructure;

namespace PackScript.Tests.Integration
{
    [TestFixture]
    public class FileChangeTests
    {
        private TestFilesApi api;
        private PackContext context;
        private string basePath = @"..\..\Integration\FileChange";

        [SetUp]
        public void Setup()
        {
            api = new TestFilesApi();
            context = ContextFactory.Create(basePath, api).ScanForResources().BuildAll();
        }

        [Test]
        public void Modify_excluded_file_does_not_trigger_build()
        {
            context.FileChanged(FullPath("input.txt"), FullPath("input.txt"), "modify");
            api.writeFileCalls.Count.Should().Be(1);
        }

        [Test]
        public void Modify_included_file_triggers_build()
        {
            context.FileChanged(FullPath("input.js"), FullPath("input.js"), "modify");
            api.writeFileCalls.Count.Should().Be(2);
        }

        [Test]
        public void Add_excluded_file_does_not_trigger_build()
        {
            context.FileChanged(FullPath("input.txt"), FullPath("input.txt"), "add");
            api.writeFileCalls.Count.Should().Be(1);
        }

        [Test]
        public void Add_included_file_triggers_build()
        {
            context.FileChanged(FullPath("input.js"), FullPath("input.js"), "add");
            api.writeFileCalls.Count.Should().Be(2);
        }

        [Test]
        public void Add_template_rereads_template()
        {
            context.FileChanged(FullPath("input.template.js"), FullPath("input.template.js"), "add");
            api.getFileContentsCalls.Last().Arg.Should().Contain(FullPath("input.template.js"));
        }

        [Test]
        public void Delete_excluded_file_does_not_trigger_build()
        {
            context.FileChanged(FullPath("input.txt"), FullPath("input.txt"), "delete");
            api.writeFileCalls.Count.Should().Be(1);
        }

        [Test]
        public void Delete_included_file_triggers_build()
        {
            context.FileChanged(FullPath("input.js"), FullPath("input.js"), "delete");
            api.writeFileCalls.Count.Should().Be(2);
        }

        [Test]
        public void Rename_excluded_file_does_not_trigger_build()
        {
            context.FileChanged(FullPath("input2.txt"), FullPath("input.txt"), "rename");
            api.writeFileCalls.Count.Should().Be(1);
        }

        [Test]
        public void Rename_included_file_triggers_build()
        {
            context.FileChanged(FullPath("input2.js"), FullPath("input.js"), "rename");
            api.writeFileCalls.Count.Should().Be(2);
        }


        private string FullPath(string file)
        {
            return Path.GetFullPath(basePath + "\\" + file);
        }
    }
}
