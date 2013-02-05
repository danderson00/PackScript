using System.IO;

namespace PackScript.Console
{
    public static class ChangeTypeMap
    {
        public static string ToStringChangeType(this WatcherChangeTypes changeType)
        {
            switch (changeType)
            {
                case WatcherChangeTypes.Created:
                    return "add";
                case WatcherChangeTypes.Deleted:
                    return "delete";
                case WatcherChangeTypes.Renamed:
                    return "rename";
                default:
                    return "modify";
            }
        }
    }
}
