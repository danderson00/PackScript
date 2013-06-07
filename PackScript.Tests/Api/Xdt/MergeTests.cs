using System.Xml;
using FluentAssertions;
using NUnit.Framework;
using PackScript.Api.Xdt;

namespace PackScript.Tests.Api.Xdt
{
    [TestFixture]
    public class MergeTests
    {
        [Test]
        public void Apply_merges_child_elements()
        {
            var target = Merge("<parent><target><child></child></target></parent>", "<target><child></child></target>");
            target.ChildNodes[0].ChildNodes.Count.Should().Be(2);
            target.ChildNodes[0].ChildNodes[0].Name.Should().Be("child");
            target.ChildNodes[0].ChildNodes[1].Name.Should().Be("child");
        }

        [Test]
        public void Apply_merges_attributes()
        {
            var target = Merge("<parent><target><child></child></target></parent>", "<target attribute=\"value\"></target>");
            target.ChildNodes[0].Attributes.Count.Should().Be(1);
            target.ChildNodes[0].Attributes[0].Name.Should().Be("attribute");
        }

        private XmlElement Merge(string targetXml, string transformXml)
        {
            var merge = new Merge();
            var target = CreateDocument(targetXml);
            var transform = (XmlElement)target.ImportNode(CreateDocument(transformXml).DocumentElement, true);
            merge.Apply(target.DocumentElement, transform);
            return target.DocumentElement;
        }

        private XmlDocument CreateDocument(string xml)
        {
            var document = new XmlDocument();
            document.LoadXml(xml);
            return document;
        }
    }
}
