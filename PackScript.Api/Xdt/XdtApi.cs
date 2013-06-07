using System;
using System.Xml;
using Microsoft.Web.XmlTransform;
using PackScript.Api.Interfaces;
using PackScript.Api.Log;

namespace PackScript.Api.Xdt
{
    public class XdtApi : IApi
    {
        public string Name { get { return "Xdt"; } }
        private ILogApi Logger { get; set; }

        public XdtApi(ILogApi logger)
        {
            Logger = logger;
        }

        private const string DefaultConfig = "<?xml version=\"1.0\" encoding=\"utf-8\" ?><configuration></configuration>";

        public string transform(string config, string xdt)
        {
            var document = new XmlTransformableDocument();
            try
            {
                document.LoadXml(string.IsNullOrEmpty(config) ? DefaultConfig : config);
                if (!string.IsNullOrEmpty(xdt))
                {
                    var transform = new XmlTransformation(AddImports(xdt), false, null);
                    transform.Apply(document);
                }
            }
            catch (Exception ex)
            {
                Logger.error(string.Format("An error occurred applying XDT: {0}", ex.Message));
            }
            return document.Format();
        }


        private string AddImports(string xml)
        {
            var document = new XmlDocument();
            document.LoadXml(xml);
            var import = document.CreateElement("xdt", "Import", "http://schemas.microsoft.com/XML-Document-Transform");
            import.AddAttribute("assembly", "PackScript.Api");
            import.AddAttribute("namespace", "PackScript.Api.Xdt");
            document.DocumentElement.InsertBefore(import, document.DocumentElement.ChildNodes[0]);
            return document.OuterXml;
        }
    }
}
