using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations.Schema;

namespace SiqCloset.Model
{
    public class Batch
    {
        [DatabaseGenerated(DatabaseGeneratedOption.None)]
        public int BatchID { get; set; }
        public DateTime? DateShipped { get; set; }

        public virtual ICollection<Box> Boxes { get; set; }
        public virtual ICollection<Item> Items { get; set; }
    }
}
