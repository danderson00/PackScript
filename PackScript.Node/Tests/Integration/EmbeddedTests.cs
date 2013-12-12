using FluentAssertions;
using NUnit.Framework;
using PackScript.Api.AjaxMin;
using PackScript.Host;
using PackScript.Tests.TestInfrastructure;

namespace PackScript.Tests.Integration
{
    [TestFixture]
    public class EmbeddedTests
    {
        private TestFilesApi api;
        private PackContext context;

        [SetUp]
        public void Setup()
        {
            api = new TestFilesApi();
            context = ContextFactory.Create(@"..\..\Integration\Embedded", api, new AjaxMinStylesheetMinifier()).ScanForResources().BuildAll();
        }

        [Test]
        public void Stylesheet_render_helpers_are_only_included_once()
        {
            api.Output("styles").Should().ContainOnce("__appendStyle = function");
        }

        [Test]
        public void Template_render_helpers_are_only_included_once()
        {
            api.Output("templates").Should().ContainOnce("__appendTemplate = function");
        }
    }
}
