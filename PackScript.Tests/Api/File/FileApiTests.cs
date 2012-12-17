using System;
using System.IO;
using FluentAssertions;
using NUnit.Framework;
using PackScript.Api.Files;

namespace PackScript.Tests.Api.File
{
    [TestFixture]
    public class FileApiTests
    {
        [Test]
        public void getFilenames_is_recursive_when_specified()
        {
            var files = new FilesApi().getFilenames(GetFileSystemPath(), true);
            files.Should().HaveCount(4);
        }

        [Test]
        public void getFilenames_filters_by_extension()
        {
            var files = new FilesApi().getFilenames(GetFileSystemPath("*.pack.js"), true);
            files.Should().HaveCount(2);
            files[0].Should().EndWith(@"test.pack.js");
            files[1].Should().EndWith(@"Subfolder\subfolder.pack.js");
        }

        private string GetFileSystemPath(string filter = "*.*")
        {
            return Path.GetFullPath(Environment.CurrentDirectory + @"\..\..\Api\File\FileSystem\") + filter;
        }
    }
}
