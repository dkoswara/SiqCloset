using System.Linq;
using Breeze.ContextProvider;
using Breeze.ContextProvider.EF6;
using Newtonsoft.Json.Linq;
using SiqCloset.Model;

namespace SiqCloset.DataAccess
{
    public class SiqClosetRepository
    {
        private readonly EFContextProvider<SiqClosetDbContext>
            _contextProvider = new EFContextProvider<SiqClosetDbContext>();

        private SiqClosetDbContext Context { get { return _contextProvider.Context; } }

        public string Metadata
        {
            get
            {
                var metadata = JObject.Parse(_contextProvider.Metadata());
                //ToDo: Instead of passing in model namespace, detect it from metadata
                metadata = Helper.IncludeDisplayNameAttributeInMetadata(metadata, "SiqCloset.Model");
                return metadata.ToString();
                
                //return _contextProvider.Metadata();
            }
        }

        public SaveResult SaveChanges(JObject saveBundle)
        {
            return _contextProvider.SaveChanges(saveBundle);
        }

        public IQueryable<Customer> Customers
        {
            get { return Context.Customers; }
        }

        public IQueryable<Batch> Batches
        {
            get { return Context.Batches; }
        }

        public IQueryable<Box> Boxes
        {
            get { return Context.Boxes; }
        }

        public IQueryable<Item> Items
        {
            get { return Context.Items; }
        }
        
    }
}
