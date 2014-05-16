(function () {
    'use strict';

    var controllerId = 'customers';

    angular.module('app').controller(controllerId,
        ['$location','common','datacontext', customers]);

    function customers($location, common, datacontext) {
        var vm = this;
        var getLogFn = common.logger.getLogFn;
        var log = getLogFn(controllerId);
        
        vm.title = 'Customers';
        vm.customerPartials = [];
        vm.goToCustomer = goToCustomer;

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
                    return vm.customerPartials = data;
                });
        }
        
        function goToCustomer(customer) {
            if (customer && customer.customerID) {
                $location.path('/customer/' + customer.customerID);
            }
        }

        
    }
})();
