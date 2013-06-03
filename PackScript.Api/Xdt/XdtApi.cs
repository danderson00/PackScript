using Microsoft.Web.XmlTransform;
using PackScript.Api.Interfaces;

namespace PackScript.Api.Xdt
{
    public class XdtApi : IApi
    {
        public string Name { get { return "Xdt"; } }

        private const string DefaultConfig = "<?xml version=\"1.0\" encoding=\"utf-8\" ?><configuration></configuration>";

        public string transform(string config, string xdt)
        {
            var document = new XmlTransformableDocument();
            document.LoadXml(string.IsNullOrEmpty(config) ? DefaultConfig : config);
            var transform = new XmlTransformation(xdt, false, null);
            transform.Apply(document);
            return document.OuterXml;
        }
    }
}
