(function () {
    'use strict';

    var controllerId = 'batches';

    angular.module('app').controller(controllerId,
        ['$state', 'common', 'datacontext', batches]);

    function batches($state, common, datacontext) {
        var vm = this;
        var getLogFn = common.logger.getLogFn;
        var log = getLogFn(controllerId);

        vm.title = 'Batches';
        vm.batchPartials = [];
        vm.goToBatch = goToBatch;
        vm.addNewBatch = addNewBatch;

        activate();

        function activate() {
            common.activateController([getBatchesPartials()], controllerId)
               .then(function () {
                   log('Activated Batches View');
               });
        }

        function getBatchesPartials() {
            return datacontext.batch.getPartials()
                .then(function (data) {
                    return vm.batchPartials = data;
                });
        }

        function goToBatch(batch) {
            if (batch && batch.batchID) {
                $state.go('batchDetail', { id: batch.batchID });
            }
        }

        function addNewBatch() {
            var newBatchID = 0;
            if (vm.batchPartials.length > 0) {
                newBatchID = vm.batchPartials[vm.batchPartials.length - 1].batchID + 1;
            }
            //$state.path('/batch/new' + newBatchID);
            $state.go('batchDetail', { id: 'new' + newBatchID });
        }

    }
})();
