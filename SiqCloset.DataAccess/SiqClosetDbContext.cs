using System.Data.Entity;
using System.Data.Entity.ModelConfiguration.Conventions;
using SiqCloset.Model;

namespace SiqCloset.DataAccess
{
    public class SiqClosetDbContext : DbContext
    {
        public SiqClosetDbContext()
            : base(nameOrConnectionString: "SiqCloset") { }

        static SiqClosetDbContext()
        {
            Database.SetInitializer<SiqClosetDbContext>(null);
        }

        protected override void OnModelCreating(DbModelBuilder modelBuilder)
        {
            // Use singular table names
            modelBuilder.Conventions.Remove<PluralizingTableNameConvention>();

            // Disable proxy creation and lazy loading; not wanted in this service context.
            Configuration.ProxyCreationEnabled = false;
            Configuration.LazyLoadingEnabled = false;

            /*For testing and answering SO post
             * http://stackoverflow.com/questions/23567327/using-breezejs-with-entity-framework-mapped-procedures
             */
            //modelBuilder
            //    .Entity<Customer>()
            //    .MapToStoredProcedures();
        }

        public DbSet<Customer> Customers { get; set; }
        public DbSet<Box> Boxes { get; set; }
        public DbSet<Batch> Batches { get; set; }
        public DbSet<Item> Items { get; set; }
    }
}
