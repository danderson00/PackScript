using System;
using System.Diagnostics;
using PackScript.Api.Interfaces;
using PackScript.Api.Log;

namespace PackScript.Api.Sass
{
    public class SassApi : IApi
    {
        private string RubyPath { get; set; }
        private ILogApi Log { get; set; }

        public SassApi(string rubyPath, ILogApi log)
        {
            RubyPath = rubyPath;
            Log = log;
        }

        public string Name 
        {
            get { return "Sass"; }
        }

        public string apply(string source)
        {
            var info = new ProcessStartInfo
            {
                FileName = string.Format("{0}ruby.exe", RubyPath),
                Arguments = string.Format("{0}sass --scss", RubyPath),
                RedirectStandardError = true,
                RedirectStandardInput = true,
                RedirectStandardOutput = true,
                UseShellExecute = false,
                CreateNoWindow = true
            };

            try
            {
                var p = Process.Start(info);

                using (var input = p.StandardInput)
                    input.Write(source);

                var output = p.StandardOutput.ReadToEnd();
                var error = p.StandardError.ReadToEnd();

                if(!string.IsNullOrEmpty(error))
                    Log.warn(string.Format("SASS returned error: {0}", error));

                return output;
            }
            catch (Exception ex)
            {
                Log.error(string.Format("Unable to start SASS: {0}", ex.Message));
                return string.Empty;
            }
        }
    }
}
