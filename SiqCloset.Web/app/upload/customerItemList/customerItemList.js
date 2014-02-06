(function () {
    'use strict';
    var controllerId = 'uploadCIL';
    angular.module('app').controller(controllerId,
        ['common', 'customerItemListReader', 'datacontext', uploadCIL]);

    function uploadCIL(common, customerItemListReader, datacontext) {
        var getLogFn = common.logger.getLogFn;
        var log = getLogFn(controllerId);
        var logError = getLogFn(controllerId, 'error');
        var underscore = _;

        var vm = this;
        var customerItemLists = [];
        
        vm.title = 'Upload Customer Item List Here';
        vm.customers = [];
        vm.batchNumber = '';
        vm.saveCustomerItemList = saveCustomerItemList;
        
        vm.onFileSelect = function ($files) {
            var file = $files[0];
            processCustItemListFile(file, customerItemListReader.getCustItemList);
        };

        function saveCustomerItemList() {
            var batch = datacontext.customer.createBatchBoxItem(vm.batchNumber, customerItemLists);
            var missingCustomers = underscore.where(batch.items, { customerID: null });
            return datacontext.save();
        }

        activate();

        function activate() {
            common.activateController([], controllerId)
                .then(function () { log('Activated CIL View'); });
        }
        
        function processCustItemListFile(file, fn) {
            var reader = new FileReader();
            reader.onload = function (e) {
                var data = e.target.result;
                customerItemLists = fn(data, vm.batchNumber);
                log('Finished reading CIL');
            };
            reader.readAsBinaryString(file);
        }
    }
})();