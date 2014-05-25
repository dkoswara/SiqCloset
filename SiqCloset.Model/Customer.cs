using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.ComponentModel.DataAnnotations;

namespace SiqCloset.Model
{
    public class Customer
    {
        public Guid CustomerID { get; set; }
        [Required]
        [DisplayName("Customer Name")]
        public string Name { get; set; }
        public string Address { get; set; }
        [DisplayName("Phone No")]
        public string PhoneNo { get; set; }

        public virtual ICollection<Item> Items { get; set; }
    }
}
