(function () {
    'use strict';
    var controllerId = 'masterCustomerAddress';
    angular.module('app').controller(controllerId,
        ['common', 'masterCustomerAddressReader', 'datacontext', 'config', masterCustomerAddress]);

    function masterCustomerAddress(common, masterCustomerAddressReader, datacontext, config) {
        var getLogFn = common.logger.getLogFn;
        var log = getLogFn(controllerId);
        var logError = getLogFn(controllerId, 'error');
        
        var vm = this;
        var manager;

        vm.title = 'Upload Master Customer Address Here';
        vm.customers = [];
        vm.showData = showData;
        
        vm.onFileSelect = function ($files) {
            var file = $files[0];
            processMasterCustAddrFile(file, masterCustomerAddressReader.getMasterCustAddress);
        };

        function showData() {
            vm.customers = datacontext.customer.getLocalFromManager(manager);
        };

        vm.saveAllCustomers = function() {
            manager.saveChanges()
                .then(function(saveResult) {
                    log('Save all customers successful', saveResult.entities.length, true);
                })
                .fail(function (error) {
                    var msg = config.appErrorPrefix + 'Error saving changes.' + error.message;
                    logError(msg, error);
                    throw error;
                });
        };
        
        activate();

        function activate() {
            common.activateController([], controllerId)
                .then(function () { log('Activated MCA View'); });
        }
        
        function processMasterCustAddrFile(file, fn) {
            var reader = new FileReader();
            reader.onload = function (e) {
                var data = e.target.result;
                manager = fn(data);
                log('Finished grabbing master customer address');
            };
            reader.readAsBinaryString(file);
        }
    }
})();