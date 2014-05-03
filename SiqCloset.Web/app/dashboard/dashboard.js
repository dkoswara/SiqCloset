(function () {
    'use strict';
    var controllerId = 'dashboard';
    angular.module('app').controller(controllerId, ['common', 'datacontext', 'currencyExchange', dashboard]);

    function dashboard(common, datacontext, currencyExchange) {
        var getLogFn = common.logger.getLogFn;
        var log = getLogFn(controllerId);

        var vm = this;
        vm.news = {
            title: 'SiqCloset',
            description: 'SiqCloset is a SPA to manage my wife\'s hobby of shopping',
        };
        vm.messageCount = 0;
        vm.customersCount = 0;
        vm.exchangeRateText = '';
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
                //getAllCustomers(),
                getCustomerCount(),
                getExchangeRate(),
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

                //ToDo: Need some real validation here
                //This validation is just for testing purposes
                //datacontext.customer.applyCustomerValidation();

                return vm.customersCount = data;
            });
        }

        function getExchangeRate() {
            //vm.exchangeRateText = String.format('$1 = {0}rp', 11530.7);
            return currencyExchange.getData().then(function(results) {
                return vm.exchangeRateText = String.format('$1 = Rp. {0}', results.data.rate);
            });
        }

        function setContentSort(prop) {
            vm.customerSummary.predicate = prop;
            vm.customerSummary.reverse = !vm.customerSummary.reverse;
        }
    }
})();