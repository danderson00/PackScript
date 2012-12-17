using System.Collections.Generic;
using PackScript.Api;
using PackScript.Api.Interfaces;

namespace PackScript.Tests.TestInfrastructure
{
    public class TestApi : IApi    
    {
        public string Name { get { return "Test"; } }

        public TestApi()
        {
            Values = new List<string>();
        }

        public List<string> Values { get; set; }
        public void AddValue(string value)
        {
            Values.Add(value);
        }
    }
}
