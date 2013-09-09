using System.IO;
using NUnit.Framework;
using PackScript.Console;

namespace PackScript.Tests.Console
{
    [TestFixture]
    public class OptionsProviderTests
    {
        [Test]
        public void Create_sets_defaults()
        {
            var options = OptionsProvider.Create(new string[] {});
            Assert.AreEqual(false, options.watch);
            Assert.AreEqual(Directory.GetCurrentDirectory(), options.directory);
        }

        [Test]
        public void Directory_is_set_from_single_argument()
        {
            var options = OptionsProvider.Create(new[] { "C:\\" });
            Assert.AreEqual("C:\\", options.directory);            
        }

        [Test]
        public void Property_is_set_from_assignment_syntax()
        {
            var options = OptionsProvider.Create(new[] { "/test:value" });
            Assert.AreEqual("value", options.test);
        }

        [Test]
        public void Property_is_set_to_true_from_flag_syntax()
        {
            var options = OptionsProvider.Create(new[] { "/test" });
            Assert.AreEqual(true, options.test);
        }

        [Test]
        public void Multiple_arguments_can_be_provided()
        {
            var options = OptionsProvider.Create(new[] { "/test1:value", "C:\\", "/test2" });
            Assert.AreEqual("C:\\", options.directory);
            Assert.AreEqual("value", options.test1);
            Assert.AreEqual(true, options.test2);
            
        }
    }
}
