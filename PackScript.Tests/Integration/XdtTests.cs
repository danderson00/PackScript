﻿using FluentAssertions;
using NUnit.Framework;
using PackScript.Api.Xdt;
using PackScript.Core.Infrastructure;
using PackScript.Tests.TestInfrastructure;

namespace PackScript.Tests.Integration
{
    [TestFixture]
    public class XdtTests
    {
        private TestFilesApi api;
        private PackContext context;

        [SetUp]
        public void Setup()
        {
            api = new TestFilesApi();
            context = ContextFactory.Create(@"..\..\Integration\Xdt", api, new XdtApi()).ScanForResources().BuildAll();
        }

        [Test]
        public void Config_is_transformed()
        {
            api.Output("xdt").Should().Be("<?xml version=\"1.0\" encoding=\"utf-8\"?><configuration><connectionStrings /></configuration>");
        }
    }
}