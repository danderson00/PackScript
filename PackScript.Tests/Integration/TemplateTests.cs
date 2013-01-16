using FluentAssertions;
using NUnit.Framework;
using PackScript.Core.Infrastructure;
using PackScript.Tests.TestInfrastructure;

namespace PackScript.Tests.Integration
{
    [TestFixture]
    public class TemplateTests
    {
        private TestFilesApi api;
        private PackContext context;

        [SetUp]
        public void Setup()
        {
            api = new TestFilesApi();
            context = ContextFactory.Create(@"..\..\Integration\Template", api).ScanForResources().BuildAll();
        }

        [Test]
        public void Builtin_data()
        {
            api.Output("builtinData").Should().Contain("..\\..\\Integration\\Template\\root.txt\r\n", "path");
            api.Output("builtinData").Should().Contain("root\r\n", "content");
            api.Output("builtinData").Should().Contain("..\\..\\Integration\\Template\\\r\n", "configPath");
            api.Output("builtinData").Should().Contain("root.txt\r\n", "pathRelativeToConfig");

            api.Output("builtinData").Should().Contain("..\\..\\Integration\\Template\\Subfolder\\subfolder.txt\r\n", "path");
            api.Output("builtinData").Should().Contain("subfolder\r\n", "content");
            api.Output("builtinData").Should().Contain("..\\..\\Integration\\Template\\\r\n", "configPath");
            api.Output("builtinData").Should().Contain("Subfolder\\subfolder.txt\r\n", "pathRelativeToConfig");
        }

        [Test]
        public void Separate_templates_can_be_defined_each_input()
        {
            api.Output("separateTemplates").Should().Contain("root1");
            api.Output("separateTemplates").Should().Contain("subfolder2");
        }

        [Test]
        public void Path_relative_to_include()
        {
            api.Output("pathRelativeToInclude").Should().Contain("subfolder.txt\r\n");
            api.Output("pathRelativeToInclude").Should().Contain("Subfolder2\\subfolder2.js\r\n");
        }
    }
}
