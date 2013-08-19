using System;
using System.Collections.Generic;
using System.IO;
using FluentAssertions;
using NUnit.Framework;
using PackScript.Api.Files;
using PackScript.Api.Log;

namespace PackScript.Tests.Api.Files
{
    [TestFixture]
    public class FileApiTests
    {
        private FilesApi api = new FilesApi(new DebugLogApi(), new Retry(new DebugLogApi()));

        [SetUp]
        public void SetUp()
        {
            if (Directory.Exists(GetFileSystemPath() + @"\Copy\Target"))
                Directory.Delete(GetFileSystemPath() + @"\Copy\Target", true);
        }

        [Test]
        public void getFilenames_is_recursive_when_specified()
        {
            var files = api.getFilenames(GetFileSystemPath("*.*"), true);
            files.Should().HaveCount(4);
        }

        [Test]
        public void getFilenames_filters_by_extension()
        {
            var files = api.getFilenames(GetFileSystemPath("*.pack.js"), true);
            files.Should().HaveCount(2);
            files[0].Should().EndWith(@"test.pack.js");
            files[1].Should().EndWith(@"Subfolder\subfolder.pack.js");
        }

        [Test]
        public void copyFiles_creates_destination_and_copies_files()
        {
            api.copyFile(GetFileSystemPath(@"test.js"), GetFileSystemPath(@"Copy\Target\test.js"));
            api.copyFile(GetFileSystemPath(@"Subfolder\subfolder.js"), GetFileSystemPath(@"Copy\Target\subfolder.js"));

            File.Exists(GetFileSystemPath(@"Copy\Target\test.js")).Should().BeTrue();
            File.Exists(GetFileSystemPath(@"Copy\Target\subfolder.js")).Should().BeTrue();
        }

        private string GetFileSystemPath(string filter = "")
        {
            return Path.GetFullPath(Environment.CurrentDirectory + @"\..\..\Api\Files\FileSystem\") + filter;
        }
    }
}
