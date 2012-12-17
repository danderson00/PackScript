using System.Diagnostics;

namespace PackScript.Tests.TestInfrastructure
{
    internal class Call
    {
        public string Caller { get; private set; }

        public Call()
        {
            Caller = new StackFrame(3, true).GetMethod().Name;
        }

        public static Call Create()
        {
            return new Call();
        }

        public static Call<TArg> Create<TArg>(TArg arg)
        {
            return new Call<TArg> { Arg = arg };
        }

        public static Call<TFirstArg, TSecondArg> Create<TFirstArg, TSecondArg>(TFirstArg firstArg, TSecondArg secondArg)
        {
            return new Call<TFirstArg, TSecondArg> { FirstArg = firstArg, SecondArg = secondArg };
        }

        public static Call<TFirstArg, TSecondArg, TThirdArg> Create<TFirstArg, TSecondArg, TThirdArg>(TFirstArg firstArg, TSecondArg secondArg, TThirdArg thirdArg)
        {
            return new Call<TFirstArg, TSecondArg, TThirdArg> { FirstArg = firstArg, SecondArg = secondArg, ThirdArg = thirdArg };
        }

        public override string ToString()
        {
            return string.Format("{0}()", Caller);
        }
    }

    internal class Call<TArg> : Call
    {
        public TArg Arg { get; set; }

        public override string ToString()
        {
            return string.Format("{0}({1})", Caller, Arg);
        }
    }

    internal class Call<TFirstArg, TSecondArg> : Call
    {
        public TFirstArg FirstArg { get; set; }
        public TSecondArg SecondArg { get; set; }

        public override string ToString()
        {
            return string.Format("{0}({1}, {2})", Caller, FirstArg, SecondArg);
        }
    }


    internal class Call<TFirstArg, TSecondArg, TThirdArg> : Call
    {
        public TFirstArg FirstArg { get; set; }
        public TSecondArg SecondArg { get; set; }
        public TThirdArg ThirdArg { get; set; }

        public override string ToString()
        {
            return string.Format("{0}({1}, {2}, {3})", Caller, FirstArg, SecondArg, ThirdArg);
        }
    }
}
