(function () {
    'use strict';

    var controllerId = 'batches';

    angular.module('app').controller(controllerId,
        ['common', 'datacontext', batches]);

    function batches(common, datacontext) {
        var vm = this;
        var getLogFn = common.logger.getLogFn;
        var log = getLogFn(controllerId);

        vm.title = 'Batches';
        vm.batchPartials = [];

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

    }
})();
