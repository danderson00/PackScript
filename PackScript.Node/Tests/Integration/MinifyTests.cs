using FluentAssertions;
using NUnit.Framework;
using PackScript.Api.AjaxMin;
using PackScript.Host;
using PackScript.Tests.TestInfrastructure;

namespace PackScript.Tests.Integration
{
    [TestFixture]
    public class MinifyTests
    {
        private TestFilesApi api;
        private PackContext context;

        [SetUp]
        public void Setup()
        {
            api = new TestFilesApi();
            context = ContextFactory.Create(@"..\..\Integration\Minify", api, new AjaxMinJavascriptMinifier(), new AjaxMinStylesheetMinifier()).ScanForResources().BuildAll();
        }

        [Test]
        public void Javascript_is_minified()
        {
            api.Output("javascript.js").Should().Be("function name(n){var t=n}");
        }

        [Test]
        public void Markup_is_minified()
        {
            api.Output("markup.htm").Should().Be("<html>\r\n    <body></body>\r\n</html>");
        }

        [Test]
        public void Stylesheet_is_minified()
        {
            api.Output("stylesheet.css").Should().Be(".class{}");
        }
    }
}
