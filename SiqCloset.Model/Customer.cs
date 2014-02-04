using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace SiqCloset.Model
{
    public class Customer
    {
        public Guid CustomerID { get; set; }
        [Required]
        public string Name { get; set; }
        public string Address { get; set; }
        public string PhoneNo { get; set; }

        public virtual ICollection<Item> Items { get; set; }
    }
}
