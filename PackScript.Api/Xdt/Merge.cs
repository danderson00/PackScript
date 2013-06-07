using System.Linq;
using System.Xml;
using Microsoft.Web.XmlTransform;

namespace PackScript.Api.Xdt
{
    public class Merge : Transform
    {
        public Merge() : base(TransformFlags.UseParentAsTargetNode) { }

        protected override void Apply()
        {
            Apply((XmlElement)TargetNode, (XmlElement)TransformNode);
        }

        public void Apply(XmlElement targetElement, XmlElement transformElement)
        {
            var targetChildElement = targetElement
                .ChildNodes.OfType<XmlElement>()
                .FirstOrDefault(x => x.LocalName == transformElement.LocalName);

            if (targetChildElement == null)
            {
                targetElement.AppendChild(transformElement);
                return;
            }

            foreach (var transformChildElement in transformElement.Attributes.Cast<XmlAttribute>())
                targetChildElement.Attributes.Append((XmlAttribute)targetChildElement.OwnerDocument.ImportNode(transformChildElement, true));

            foreach (var transformChildElement in transformElement.ChildNodes.OfType<XmlElement>())
                targetChildElement.AppendChild(targetChildElement.OwnerDocument.ImportNode(transformChildElement, true));
        }
    }
}