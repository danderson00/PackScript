using System.Linq;
using System.Reflection;
using Noesis.Javascript.Dynamic;
using PackScript.Api.Interfaces;

namespace PackScript.Host
{
    public class ApiContext<T> : JContext where T : ApiContext<T>
    {
        public T AddApi(IApi target)
        {
            Context.SetParameter(target.Name, target);
            return (T)this;
        }

        public void RegisterApi(IApi target)
        {
            AddApi(target);
        }

        public T RegisterJavascript(string source)
        {
            Execute(source);
            return (T)this;
        }

        public T RegisterJavascript(Assembly assembly)
        {
            assembly.LoadJavascript().ToList().ForEach(x => RegisterJavascript(x));
            return (T)this;
        }
    }
}
