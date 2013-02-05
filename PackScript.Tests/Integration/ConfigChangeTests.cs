using System.Collections.Generic;
using System.IO;
using FluentAssertions;
using NUnit.Framework;
using PackScript.Core.Infrastructure;
using PackScript.Tests.TestInfrastructure;

namespace PackScript.Tests.Integration
{
    [TestFixture]
    public class ConfigChangeTests
    {
        private StubFilesApi api;
        private PackContext context;

        [SetUp]
        public void Setup()
        {
            api = new StubFilesApi();
            api.Files = new Dictionary<string, string>
                            {
                                {"input.js", "input"},
                                {"pack.js", "pack({ to: 'output', include: '*.js' })"}
                            };
            context = ContextFactory.Create("", api).ScanForResources().BuildAll();
        }

        [Test]
        public void Modify_config_file_refreshes_config()
        {
            context.FileChanged("pack.js", "pack.js", "modify");
            int length = context.Evaluate("pack.outputs.length");
            length.Should().Be(1);
        }

        [Test]
        public void Modify_config_file_triggers_build()
        {
            api.Writes.Count.Should().Be(1);
            context.FileChanged("pack.js", "pack.js", "modify");
            api.Writes.Count.Should().Be(2);
        }

        [Test]
        public void Add_config_file_adds_new_config()
        {
            api.Files.Add("new.pack.js", "pack({ to: 'output2', include: '*.js' })");
            context.FileChanged("new.pack.js", "new.pack.js", "add");
            int length = context.Evaluate("pack.outputs.length");
            length.Should().Be(2);
        }

        [Test]
        public void Add_config_file_triggers_build()
        {
            api.Files.Add("new.pack.js", "pack({ to: 'output2', include: '*.js' })");
            context.FileChanged("new.pack.js", "new.pack.js", "add");
            api.Writes.Count.Should().Be(2);
        }

        [Test]
        public void Delete_config_file_removes_old_config()
        {
            api.Files.Remove("pack.js");
            context.FileChanged("pack.js", "pack.js", "delete");
            int length = context.Evaluate("pack.outputs.length");
            length.Should().Be(0);
        }

        [Test]
        public void Delete_config_file_does_not_trigger_build()
        {
            api.Writes.Count.Should().Be(1);
            api.Files.Remove("pack.js");
            context.FileChanged("pack.js", "pack.js", "delete");
            api.Writes.Count.Should().Be(1);
        }

        [Test]
        public void Rename_config_file_removes_old_config()
        {
            api.Files.Add("renamed.pack.js", api.Files["pack.js"]);
            api.Files.Remove("pack.js");
            context.FileChanged("renamed.pack.js", "pack.js", "rename");
            int length = context.Evaluate("pack.outputs.length");
            length.Should().Be(1);
        }

        [Test]
        public void Rename_config_file_triggers_build()
        {
            api.Writes.Count.Should().Be(1);
            api.Files.Add("renamed.pack.js", api.Files["pack.js"]);
            api.Files.Remove("pack.js");
            context.FileChanged("renamed.pack.js", "pack.js", "rename");
            api.Writes.Count.Should().Be(2);
        }
    }
}
