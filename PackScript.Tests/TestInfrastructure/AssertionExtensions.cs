using System.Linq;
using FluentAssertions;
using FluentAssertions.Primitives;
using NUnit.Framework;

namespace PackScript.Tests.TestInfrastructure
{
    public static class AssertionExtensions
    {
        public static AndConstraint<StringAssertions> ContainOnce(this StringAssertions assertions, string text)
        {
            if (assertions.Subject.IndexOf(text) == -1)
                Assert.Fail("The specified string '{0}' did not contain '{1}'", assertions.Subject, text);

            if (assertions.Subject.IndexOf(text) != assertions.Subject.LastIndexOf(text))
                Assert.Fail("The specified string '{0}' contained more than one instance of '{1}'", assertions.Subject, text);

            return new AndConstraint<StringAssertions>(assertions);
        }
    }
}
