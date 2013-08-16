using FluentAssertions;
using NUnit.Framework;
using PackScript.Api.Files;

namespace PackScript.Tests.Api.Files
{
    [TestFixture]
    public class PathExtensionsTests
    {
        [Test]
        public void Matches_handles_star_wildcard()
        {
            "pack.js".Matches("*pack.js").Should().BeTrue();
            "test.pack.js".Matches("*pack.js").Should().BeTrue();
            "folder/pack.js".Matches("*pack.js").Should().BeTrue();
            "folder\\pack.js".Matches("*pack.js").Should().BeTrue();
            "c:\\folder\\pack.js".Matches("*pack.js").Should().BeTrue();

            "test.txt".Matches("*.js").Should().BeFalse();
            "Pack.js".Matches("*pack.js").Should().BeFalse();
        }

        [Test]
        public void Matches_handles_question_mark_wildcard()
        {
            "a.js".Matches("?.js").Should().BeTrue();
            "ab.js".Matches("a?.js").Should().BeTrue();

            "ab.js".Matches("?.js").Should().BeFalse();
        }
    }
}
