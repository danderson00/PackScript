using System.Text;
using System.Xml;

namespace PackScript.Api.Xdt
{
    public static class XmlExtensions
    {
        public static string Format(this XmlDocument doc)
        {
            var sb = new StringBuilder();
            var settings = new XmlWriterSettings
                {
                    Indent = true,
                    IndentChars = "  ",
                    NewLineChars = "\r\n",
                    NewLineHandling = NewLineHandling.Replace
                };

            using (var writer = XmlWriter.Create(sb, settings))
                doc.Save(writer);

            return sb.ToString();
        }

        public static XmlElement AddAttribute(this XmlElement element, string name, string value)
        {
            var attribute = element.OwnerDocument.CreateAttribute(name);
            attribute.Value = value;
            element.Attributes.Append(attribute);
            return element;
        }
    }
}
