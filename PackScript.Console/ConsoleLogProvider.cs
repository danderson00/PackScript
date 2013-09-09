using System;
using System.Linq;
using PackScript.Api.Log;

namespace PackScript.Console
{
    public class ConsoleLogProvider : ILogProvider
    {
        public void Write(LogLevel level, string message)
        {
            System.Console.ForegroundColor = SetColour(level);
            Write(message, level == LogLevel.Error);
            System.Console.ForegroundColor = ConsoleColor.Gray;
        }

        private ConsoleColor SetColour(LogLevel level)
        {
            switch (level)
            {
                case LogLevel.Debug:
                    return ConsoleColor.Gray;
                case LogLevel.Info:
                    return ConsoleColor.White;
                case LogLevel.Warn:
                    return ConsoleColor.Yellow;
                case LogLevel.Error:
                    return ConsoleColor.Red;
                default:
                    return ConsoleColor.Gray;
            }
        }

        private void Write(string message, bool error)
        {            
            var output = string.Format("{0} {1} {2}", DateTime.Now.ToShortDateString(), DateTime.Now.ToShortTimeString(), SanitiseMessage(message));
            if (error)
                System.Console.Error.WriteLine(output);
            else
                System.Console.WriteLine(output);
        }

        // bodgy workaround for ajaxmin error messages involving braces
        private string SanitiseMessage(string message)
        {
            if (string.IsNullOrEmpty(message))
                return "";

            var left = message.Count(x => x == '{');
            var right = message.Count(x => x == '}');

            if ((right == 1 && left == 0) || (right == 0 && left == 1))
                return message.Replace("{", "{{").Replace("}", "}}");

            return message;
        }

        /*

        /// <summary>
        /// Reads a rectangular block of character and attribute information from the screen buffer into the passed array.
        /// </summary>
        /// <param name="buff">The array into which character information is to be placed.</param>
        /// <param name="buffX">The column position in the array where the first character is to be placed.</param>
        /// <param name="buffY">The row position in the array where the first character is to be placed.</param>
        /// <param name="left">Column position of the top-left corner of the screen buffer area from which characters are to be read.</param>
        /// <param name="top">Row position of the top-left corner of the screen buffer area from which characters are to be read.</param>
        /// <param name="right">Column position of the bottom-right corner of the screen buffer area from which characters are to be read.</param>
        /// <param name="bottom">Row position of the bottom-right corner of the screen buffer area from which characters are to be read.</param>
        public void ReadBlock(ConsoleCharInfo[,] buff, int buffX, int buffY, int left, int top, int right, int bottom)
		{
			if (disposed)
			{
				throw new ObjectDisposedException(this.ToString());
			}
			// determine size of the buffer
			Coord bufferSize = new Coord ((short)buff.GetLength(1), (short)buff.GetLength(0));
            Coord bufferPos = new Coord((short)buffX, (short)buffY);
            SmallRect readRegion = new SmallRect((short)left, (short)top, (short)right, (short)bottom);
			if (!WinCon.ReadConsoleOutput(handle, buff, bufferSize, bufferPos, readRegion))
			{
				throw new IOException("Read error.", Marshal.GetLastWin32Error());
			}
		}
                  
		[DllImport("kernel32.dll", SetLastError=true)]
		public static extern bool ReadConsoleOutput(
			IntPtr hConsoleOutput,
			[Out][MarshalAs(UnmanagedType.LPArray, SizeParamIndex=2)]ConsoleCharInfo[,] lpBuffer,
			Coord dwBufferSize,
			Coord dwBufferCoord,
			[In,Out][MarshalAs(UnmanagedType.LPStruct)]SmallRect lpReadRegion);

         */
    }
}