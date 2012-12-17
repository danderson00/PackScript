using System;
using NQUnit;
using NUnit.Framework;

namespace PackScript.Tests.Core.NQUnit
{
    public static class NUnitNQUnitHelpers
    {
        public static void ShouldPass(this QUnitTest theTest)
        {
            if (theTest.InitializationException != null)
                throw new Exception("The QUnit initialization failed.", theTest.InitializationException);

            Assert.That(theTest.Result, Is.EqualTo("pass"), "Test: " + theTest.TestName + Environment.NewLine + theTest.Message);
        }
    }
}
