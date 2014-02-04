(function () {
    'use strict';

    // Factory name is handy for logging
    var serviceId = 'masterCustomerAddressReader';

    // Define the factory on the module.
    // Inject the dependencies. 
    // Point to the factory definition function.
    // TODO: replace app with your module name
    angular.module('app').factory(serviceId, ['entityManagerFactory', masterCustomerAddressReader]);

    function masterCustomerAddressReader(emFactory) {
        // Define the functions and properties to reveal.
        var manager = emFactory.newManager();

        var service = {
            getMasterCustAddress: getMasterCustAddress,
        };

        return service;

        function getMasterCustAddress(data) {
            xlsworker(data, parseWorkbook, manager);
            return manager;
        }

        function xlsworker(data, cb) {
            var cfb = XLS.CFB.read(data, { type: "binary" });
            var v = XLS.parse_xlscfb(cfb);
            cb(v);
        }

        function parseWorkbook(workbook) {
            var sheet = workbook.Sheets['Sheet1'];
            var json = XLS.utils.sheet_to_row_object_array(sheet);
            json.forEach(function(o) {
                if (o['Address']) {
                    var id = breeze.core.getUuid();
                    var name = o['Name'];
                    var addr = o['Address'];
                    var phoneNo = o['Phone Number'];

                    var newCust = manager.createEntity('Customer', { customerID: id, name: name, address: addr, phoneNo: phoneNo });
                }
            });
        }
    }
})();