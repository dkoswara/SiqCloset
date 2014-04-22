(function () {
    'use strict';

    var serviceId = 'masterCustomerAddressReader';
    angular.module('app').factory(serviceId, ['datacontext', masterCustomerAddressReader]);

    function masterCustomerAddressReader(datacontext) {
        var service = {
            getMasterCustAddress: getMasterCustAddress,
            updateMasterCustAddress: updateMasterCustAddress,
        };

        return service;

        function getMasterCustAddress(data) {
            var wb = parseWorkbook(data);
            createCustFromWorkbook(wb);
        }

        function updateMasterCustAddress(data) {
            var wb = parseWorkbook(data);
            updateCustFromWorkbook(wb);
        }

        function parseWorkbook(data) {
            var cfb = XLS.CFB.read(data, { type: "binary" });
            return XLS.parse_xlscfb(cfb);
        }

        function createCustFromWorkbook(workbook) {
            var sheet = workbook.Sheets['Sheet1'];
            var json = XLS.utils.sheet_to_row_object_array(sheet);
            json.forEach(function (o) {
                var name = o['Name'];
                var addr = o['Address'];
                var phoneNo = o['Phone Number'];
                if (name && addr && phoneNo) {
                    var inits = {
                        customerID: breeze.core.getUuid(),
                        name: name,
                        address: addr,
                        phoneNo: phoneNo
                    };
                    datacontext.customer.create(inits);
                }
            });
        }

        function updateCustFromWorkbook(workbook) {
            var sheet = workbook.Sheets['Sheet1'];
            var json = XLS.utils.sheet_to_row_object_array(sheet);
            json.forEach(function (o) {
                var name = o['Name'];
                var addr = o['Address'];
                var phoneNo = o['Phone Number'];
                if (name && addr && phoneNo) {
                    var existingCust = datacontext.customer.getCustomerByName(name);
                    if (!existingCust) {
                        var inits = {
                            customerID: breeze.core.getUuid(),
                            name: name,
                            address: addr,
                            phoneNo: phoneNo
                        };
                        var newCust = datacontext.customer.create(inits);
                        storeToWip(newCust);
                    } else {
                        updateExistingCust(existingCust, addr, phoneNo);
                    }
                }
            });

            function updateExistingCust(existingCust, newAddr, newPhoneNo) {
                onlyUpdateIfDiff(existingCust, 'address', newAddr);
                onlyUpdateIfDiff(existingCust, 'phoneNo', newPhoneNo);

                function onlyUpdateIfDiff(entity, propName, value) {
                    var currValue = entity.getProperty(propName);
                    if (currValue != value) {
                        entity.setProperty(propName, value);
                        storeToWip(entity);
                    }
                }
            }
        }

        function storeToWip(customer) {
            datacontext.zStorageWip.storeWipEntity(
                customer,
                customer.customerID,
                customer.customerID,
                'Customer',
                customer.name);
        }
    }
})();