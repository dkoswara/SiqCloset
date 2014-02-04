using System;
using System.Collections.Generic;

namespace SiqCloset.Model
{
    public class Box
    {
        public Guid BoxID { get; set; }
        public string TrackingNo { get; set; }
        public int? BoxNo { get; set; }
        public decimal Weight { get; set; }
        public DateTime? LatestEstDeliveryDate { get; set; }
        public int? BatchID { get; set; }
        
        public virtual Batch Batch { get; set; }
        public virtual ICollection<Item> Items { get; set; }
    }
}
