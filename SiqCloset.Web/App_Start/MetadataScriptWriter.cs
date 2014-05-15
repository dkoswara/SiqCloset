using System.IO;
using System.Web.Hosting;
using SiqCloset.DataAccess;

namespace SiqCloset.Web.App_Start
{
    public static class MetadataScriptWriter
    {
        public static void Write()
        {
            // construct the filename and runtime file location
            var filename = HostingEnvironment.MapPath("~/app/metadata.js");
            if (File.Exists(filename)) return;

            // get the metadata the same way we get it for the controller
            var metadata = new SiqClosetRepository().Metadata;

            // the same pre- and post-fix strings we used earlier
            const string prefix = "window.app = window.app || {}; window.app.metadata = JSON.stringify(";

            const string postfix = ");";

            // write to file
            using (var writer = new StreamWriter(filename))
            {
                writer.WriteLine(prefix + metadata + postfix);
            }
        }
    }
}