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
            get { return _contextProvider.Metadata(); }
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
