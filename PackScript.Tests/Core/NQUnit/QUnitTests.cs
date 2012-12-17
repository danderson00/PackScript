//using System;
//using System.Collections.Generic;
//using System.IO;
//using NQUnit;
//using NUnit.Framework;

//namespace PackScript.Tests.Javascript.NQUnit
//{
//    [TestFixture]
//    public class QUnitTests
//    {
//        [Test, TestCaseSource("GetQUnitTests")]
//        public void Test(QUnitTest test)
//        {
//            test.ShouldPass();
//        }

//        public IEnumerable<QUnitTest> GetQUnitTests()
//        {
//            var testsDirectory = Path.Combine(Environment.CurrentDirectory, "Javascript");
//            return global::NQUnit.NQUnit.GetTests(Directory.GetFiles(testsDirectory, "*.htm"));
//        }
//    }
//}