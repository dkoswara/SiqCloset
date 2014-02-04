(function () {
    'use strict';

    var controllerId = 'wip';

    angular.module('app').controller(controllerId,
        ['$scope', '$location', 'bootstrap.dialog', 'config', 'datacontext', 'common', wip]);

    function wip($scope, $location, bsDialog, config, datacontext, common) {
        var vm = this;
        var log = common.logger.getLogFn(controllerId);

        vm.cancelAllWip = cancelAllWip;
        vm.predicate = '';
        vm.reverse = false;
        vm.setSort = setSort;
        vm.title = 'Work in Progress';
        vm.wip = [];
        vm.goToWip = goToWip;

        activate();

        function activate() {
            common.activateController([getWipSummary()], controllerId)
                .then(function () {
                    log('Activated Wip View');
                });

            $scope.$on(config.events.storage.wipChanged, function (event, data) {
                vm.wip = data;
            });
        }

        function getWipSummary() {
            vm.wip = datacontext.zStorageWip.getWipSummary();
        }

        function cancelAllWip() {
            return bsDialog.deleteDialog('Work in Progress')
                .then(confirmDelete);

            function confirmDelete() {
                datacontext.zStorageWip.clearAllWip();
            }
        }

        function goToWip(wipData) {
            $location.path('/' + wipData.routeState + '/' + wipData.id);
        }

        function setSort(prop) {
            vm.predicate = prop;
            vm.reverse = !vm.reverse;
        }

    }
})();
