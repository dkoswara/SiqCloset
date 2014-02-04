(function () {
    'use strict';
    var controllerId = 'dashboard';
    angular.module('app').controller(controllerId, ['common', 'datacontext', dashboard]);

    function dashboard(common, datacontext) {
        var getLogFn = common.logger.getLogFn;
        var log = getLogFn(controllerId);

        var vm = this;
        vm.news = {
            title: 'SiqCloset',
            description: 'SiqCloset is a SPA to manage my wife\'s hobby of shopping',
        };
        vm.messageCount = 0;
        vm.customersCount = 0;
        vm.people = [];
        vm.title = 'Dashboard';
        vm.customerSummary = {
            title: 'Customer',
            predicate: '',
            reverse: false,
            setSort: setContentSort,
            summaries: [],
        };
        activate();

        function activate() {
            var promises = [
                getAllCustomers(),
                getCustomerCount(),
               //getCustomersAndItemsCount()
            ];
            common.activateController(promises, controllerId)
                .then(function() {
                 log('Activated Dashboard View');
            });
        }

        function getAllCustomers() {
            return datacontext.customer.getAll().then(function (data) {
                log('Retrieved [All Customers] from data source', data.length, true);
            });
        }
        
        function getCustomersAndItemsCount() {
            return datacontext.customer.getCustomersAndItemsCount().then(function (data) {
                return vm.customerSummary.summaries = data;
            });
        }
        
        function getCustomerCount() {
            return datacontext.customer.getCount().then(function (data) {
                datacontext.customer.applyCustomerValidation();
                return vm.customersCount = data;
            });
        }

        function setContentSort(prop) {
            vm.customerSummary.predicate = prop;
            vm.customerSummary.reverse = !vm.customerSummary.reverse;
        }
    }
})();