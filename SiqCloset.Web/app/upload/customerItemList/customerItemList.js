(function () {
    'use strict';
    var controllerId = 'uploadCIL';
    angular.module('app').controller(controllerId,
        ['common', 'customerItemListReader', 'datacontext', uploadCIL]);

    function uploadCIL(common, customerItemListReader, datacontext) {
        var getLogFn = common.logger.getLogFn;
        var log = getLogFn(controllerId);
        var logError = getLogFn(controllerId, 'error');
        var $q = common.$q;
        var underscore = _;

        var vm = this;
        var customerItemLists = [];
        var excelFile;
        
        vm.title = 'Upload Customer Item List Here';
        vm.customers = [];
        vm.batchNumber = '';
        vm.saveCustomerItemList = saveCustomerItemList;
        
        vm.onFileSelect = function ($files) {
            excelFile = $files[0];
        };

        function saveCustomerItemList() {
            processCustItemListFile(excelFile).then(function(data) {
                customerItemLists = customerItemListReader.getCustItemList(data, vm.batchNumber);
                //var batch = datacontext.customer.createBatchBoxItem(vm.batchNumber, customerItemLists);
                //var missingCustomers = underscore.where(batch.items, { customerID: null });
                //return datacontext.save();
            });
        }

        activate();

        function activate() {
            common.activateController([], controllerId)
                .then(function () { log('Activated CIL View'); });
        }

        var processCustItemListFile = function (file) {
            var deferred = $q.defer();

            var reader = new FileReader();
            reader.onload = function (e) {
                var data = e.target.result;
                deferred.resolve(data);
                log('Finished reading CIL');
            };
            reader.readAsBinaryString(file);

            return deferred.promise;
        }
    }
})();