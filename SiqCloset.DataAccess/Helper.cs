using System;
using System.ComponentModel;
using System.Linq;
using System.Reflection;
using Newtonsoft.Json.Linq;

namespace SiqCloset.DataAccess
{
    public static class Helper
    {
        public static JObject IncludeDisplayNameAttributeInMetadata(JObject metadata, string modelNamespace)
        {
            var asm = GetAssemblyGivenNamespace(modelNamespace);
            //Just return if can't find model assembly
            if (asm == null) return metadata;

            foreach (var entityType in metadata["schema"]["entityType"])
            {
                var typeName = entityType["name"].ToString();
                var t = asm.GetType(modelNamespace + "." + typeName);

                var metaProps = entityType["property"].Type == JTokenType.Object
                    ? new[] { entityType["property"] }
                    : entityType["property"].AsEnumerable();

                var props = from p in metaProps
                            let pname = p["name"].ToString()
                            let prop = t.GetProperties().SingleOrDefault(prop => prop.Name == pname)
                            where prop != null
                            from attr in prop.CustomAttributes
                            where attr.AttributeType == typeof(DisplayNameAttribute)
                            select new
                            {
                                Prop = p,
                                DisplayName = ((DisplayNameAttribute)Attribute.GetCustomAttribute(prop, typeof(DisplayNameAttribute))).DisplayName
                            };
                foreach (var p in props)
                    p.Prop["displayName"] = p.DisplayName;
            }
            return metadata;
        }

        private static Assembly GetAssemblyGivenNamespace(string ns)
        {
            return AppDomain.CurrentDomain.GetAssemblies().FirstOrDefault(x => x.FullName.Contains(ns));
        }
    }
}
