using System;
using System.ComponentModel;

namespace SiqCloset.Model
{
    public class Item
    {
        public Guid ItemID { get; set; }
        [DisplayName("Item Code")]
        public string Code { get; set; }
        [DisplayName("Item Name")]
        public string Name { get; set; }
        public int? Size { get; set; }
        public string Type { get; set; }
        public decimal Price { get; set; }
        public string ShipVia { get; set; }
        public string Notes { get; set; }
        public Guid? CustomerID { get; set; }
        public Guid? BoxID { get; set; }
        public int? BatchID { get; set; }

        public virtual Batch Batch { get; set; }
        public virtual Box Box { get; set; }
        public virtual Customer Customer { get; set; }
    }    
}
