(function () {
    'use strict';

    angular.module('app').filter('orderCustomerLookupsBy', function() {
        return function(customers, viewValue) {
            var filtered = [];

            angular.forEach(customers, function(customer) {
                customer.relevance = getRelevance(customer.name, viewValue);
                filtered.push(customer);
            });

            return filtered;

            function getRelevance(customerName, searchValue) {
                if (customerName.substr(0, searchValue.length).toLowerCase() == searchValue.toLowerCase()) {
                    return 1;
                }

                var idx = customerName.indexOf(" ") + 1;
                var lastName = customerName.substr(idx);
                if (lastName.substr(0, searchValue.length).toLowerCase() == searchValue.toLowerCase()) {
                    return 2;
                }

                if (customerName.lastIndexOf(searchValue) != -1) {
                    return 3;
                }
                return 4;
            }
        };
    });

})();