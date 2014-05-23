(function () {
    'use strict';
    var controllerId = 'dashboard';
    angular.module('app').controller(controllerId, ['$timeout', 'common', 'datacontext', 'currencyExchange', dashboard]);

    function dashboard($timeout, common, datacontext, currencyExchange) {
        var getLogFn = common.logger.getLogFn;
        var log = getLogFn(controllerId);
        var vm = this;

        vm.intro = {
            title: 'SiqCloset',
            description: 'SiqCloset is a SPA to manage my wife\'s hobby of shopping',
        };

        vm.customersCount = 0;
        vm.exchangeRateText = '';
        vm.title = 'Dashboard';
        vm.customerSummary = {
            title: 'Customer',
            predicate: '',
            reverse: false,
            setSort: setContentSort,
            summaries: [],
        };

        var refreshTime = function () {
            vm.currentDateTime = moment().format('MMMM Do YYYY, h:mm:ss a');
            $timeout(refreshTime, 1000);
        };

        activate();

        function activate() {
            refreshTime();
            var promises = [
                getCustomerCount(),
                getExchangeRate(),
                getTopTenCustomers()
            ];
            common.activateController(promises, controllerId)
                .then(function() {
                    log('Activated Dashboard View');
            });
        }
        
        function getTopTenCustomers() {
            return datacontext.customer.getTopTenCustomers().then(function (data) {
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
            return currencyExchange.getData().then(success, fail);

            function success(results) {
                vm.exchangeRateText = String.format('$1 = Rp. {0}', results.data.rate);
            }

            function fail() {
                vm.exchangeRateText = String.format('$1 = Rp. {0}', '???');
            }
        }

        function setContentSort(prop) {
            vm.customerSummary.predicate = prop;
            vm.customerSummary.reverse = !vm.customerSummary.reverse;
        }
    }
})();