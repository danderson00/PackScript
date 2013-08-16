using System.IO;
using FluentAssertions;
using NUnit.Framework;
using PackScript.Api.Zip;

namespace PackScript.Tests.Api.Zip
{
    [TestFixture]
    public class ArchiveTests
    {
        [Test]
        public void Compress_creates_output_file()
        {
            if (File.Exists("output.zip"))
                File.Delete("output.zip");

            Archive.Compress("output.zip", "", new [] { "PackScript.Tests.dll" });

            File.Exists("output.zip").Should().BeTrue();
        }
    }
}
