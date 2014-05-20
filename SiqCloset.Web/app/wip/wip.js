(function () {
    'use strict';

    var controllerId = 'wip';

    angular.module('app').controller(controllerId,
        ['$scope', '$location', 'bootstrap.dialog', 'config', 'datacontext', 'common', wip]);

    function wip($scope, $location, bsDialog, config, datacontext, common) {
        var vm = this;
        var log = common.logger.getLogFn(controllerId);
        var logError = common.logger.getLogFn(controllerId, 'error');

        vm.cancelAllWip = cancelAllWip;
        vm.saveAllWip = saveAllWip;
        vm.predicate = '';
        vm.reverse = false;
        vm.setSort = setSort;
        vm.title = 'Work in Progress';
        vm.wip = [];
        vm.goToWip = goToWip;

        var pendingEntities = [];

        activate();

        function activate() {
            var promises = getWipSummary();
            common.activateController(promises, controllerId)
                .then(function () {
                    log('Activated Wip View');
                });

            $scope.$on(config.events.storage.wipChanged, function (event, data) {
                vm.wip = data;
            });
        }

        function loadWipEntities(wipData) {
            var promises = [];
            wipData.forEach(function(data) {
                var repoName = data.entityName.toLowerCase();
                var aPromise = datacontext[repoName].getEntityByIdOrFromWip(data.id)
                    .then(wipEntitiesLoaded);
                promises.push(aPromise);
            });
            return promises;

            function wipEntitiesLoaded(results) {
                var entity = results.entity || results;
                var desc = entity.entityType + ' loaded with id ' + entity.entityAspect.getKey().values[0];
                pendingEntities.push(entity);
                log('wip entity loaded: ', desc, false);
            }
        }

        function getWipSummary() {
            vm.wip = datacontext.zStorageWip.getWipSummary();
            return loadWipEntities(vm.wip);
        }

        function cancelAllWip() {
            return bsDialog.deleteDialog('Work in Progress')
                .then(confirmDelete);

            function confirmDelete() {
                datacontext.zStorageWip.clearAllWip();
                datacontext.cancel();
            }
        }

        function saveAllWip() {
            return bsDialog.confirmationDialog('Save all Wip', 'Confirm Save?')
                .then(confirmSave);

            function confirmSave() {
                //datacontext.save(pendingEntities, false).then(saveSuccess, saveFailed);
                datacontext.save(null, false).then(saveSuccess, saveFailed);

                function saveSuccess() {
                    log('Wip saved', '', true);
                    datacontext.zStorageWip.clearAllWip();
                }

                function saveFailed(error) {
                    logError(error.message, error);
                }
            }
        }

        function goToWip(wipData) {
            if (wipData.routeState.indexOf('/') > -1) {
                $location.path('/' + wipData.routeState);
            } else {
                $location.path('/' + wipData.routeState + '/' + wipData.id);
            }
        }

        function setSort(prop) {
            vm.predicate = prop;
            vm.reverse = !vm.reverse;
        }
    }
})();
