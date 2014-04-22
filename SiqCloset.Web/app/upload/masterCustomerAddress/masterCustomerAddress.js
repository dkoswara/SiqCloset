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
        var excelFile;

        vm.title = 'Upload Master Customer Address Here';
        vm.customers = [];
        vm.showData = showData;
        vm.saveAllCustomers = saveAllCustomers;
        vm.onFileSelect = onFileSelect;
        vm.updateMasterCustomerAddress = updateMasterCustomerAddress;
        
        activate();

        function activate() {
            common.activateController([getCustomers()], controllerId)
                .then(function () { log('Activated MCA View'); });
        }

        function getCustomers() {
            return datacontext.customer.getAll();
        }

        function onFileSelect($files) {
            excelFile = $files[0];
        };
        
        var processMasterCustAddrFile = function (file) {
            var deferred = Q.defer();

            var reader = new FileReader();
            reader.onload = function (e) {
                var data = e.target.result;
                deferred.resolve(data);
            };
            reader.readAsBinaryString(file);

            return deferred.promise;
        }

        function showData() {
            vm.customers = datacontext.customer.getLocalFromManager(manager);
        };

        function saveAllCustomers() {
            processMasterCustAddrFile(excelFile).then(function (data) {
                masterCustomerAddressReader.getMasterCustAddress(data);
            }).then(saveAllCustomersCore);

            function saveAllCustomersCore() {
                datacontext.save().then(saveSuccess, saveFailed);

                function saveSuccess(saveResult) {
                    log('Save all customers successful', saveResult.entities.length, true);
                }

                function saveFailed(error) {
                    var msg = config.appErrorPrefix + 'Error saving changes.' + error.message;
                    logError(msg, error);
                    throw error;
                }
            }
        };

        function updateMasterCustomerAddress() {
            processMasterCustAddrFile(excelFile).then(function(data) {
                masterCustomerAddressReader.updateMasterCustAddress(data);

                log('Finished processing master customer address');

                var changes = datacontext.customer.getCustomerChangesCount();
                log('Added customers: ', changes.added, false);
                log('Modified customers: ', changes.modified, false);
            });

            //datacontext.save().then(saveSuccess, saveFailed);

            function saveSuccess(saveResult) {
                log('Updating customers successful', saveResult.entities.length, true);
            }

            function saveFailed(error) {
                var msg = config.appErrorPrefix + 'Error updating customers.' + error.message;
                logError(msg, error);
                throw error;
            }
        }

    }
})();