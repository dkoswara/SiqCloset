(function () {
    'use strict';

    var controllerId = 'customers';

    angular.module('app').controller(controllerId,
        ['$state','common','config','datacontext', customers]);

    function customers($state, common, config, datacontext) {
        var vm = this;
        var getLogFn = common.logger.getLogFn;
        var log = getLogFn(controllerId);
        var keyCodes = config.keyCodes;
        
        vm.title = 'Customers';
        vm.customerPartials = [];
        vm.filteredCustomerPartials = [];
        vm.goToCustomer = goToCustomer;
        vm.searchText = undefined;
        vm.search = search;

        activate();

        function activate() {
            common.activateController([getCustomerPartials()], controllerId)
                .then(function () {
                    log('Activated Customers View');
                });
        }
        
        function getCustomerPartials() {
            return datacontext.customer.getPartials()
                .then(function (data) {
                    return vm.customerPartials = vm.filteredCustomerPartials = data;
                });
        }
        
        function goToCustomer(customer) {
            if (customer && customer.customerID) {
                $state.go('customerDetail', { id: customer.customerID });
            }
        }

        function search($event) {
            if ($event.keyCode === keyCodes.esc) {
                vm.searchText = '';
            }
            filterCustomers();

            function filterCustomers() {
                vm.filteredCustomerPartials = vm.customerPartials.filter(customerFilter);

                function customerFilter(cust) {
                    var isMatch = vm.searchText
                        ? common.textContains(cust.name, vm.searchText)
                        : true;
                    return isMatch;
                }
            }
        }

        
    }
})();
