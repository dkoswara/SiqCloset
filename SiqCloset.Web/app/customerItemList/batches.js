﻿(function () {
    'use strict';

    var controllerId = 'batches';

    angular.module('app').controller(controllerId,
        ['$location', 'common', 'datacontext', batches]);

    function batches($location, common, datacontext) {
        var vm = this;
        var getLogFn = common.logger.getLogFn;
        var log = getLogFn(controllerId);

        vm.title = 'Batches';
        vm.batchPartials = [];
        vm.goToBatch = goToBatch;

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
                $location.path('/customerItemList/' + batch.batchID);
            }
        }

    }
})();
