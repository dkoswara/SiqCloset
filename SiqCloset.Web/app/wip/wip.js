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
        vm.getDetails = getDetails;

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
            }
        }

        function goToWip(wipData) {
            $location.path('/' + wipData.routeState + '/' + wipData.id);
        }

        function setSort(prop) {
            vm.predicate = prop;
            vm.reverse = !vm.reverse;
        }

        function getDetails(item) {
            if (item.state == breeze.EntityState.Modified) {
                return getOriginalValues(item);
            }
            return '';
        }

        function getOriginalValues(data) {
            var details = '';
            var repoName = data.entityName.toLowerCase();
            var result = datacontext[repoName].getEntityByIdLocal(data.id);

            //getEntityByIdOrFromWip may return imported entity from wipStorage
            //thus, the result.entity call
            var entity = result.entity || result;

            var props = Object.keys(entity.entityAspect.originalValues);
            props.forEach(function(prop) {
                var oldValue = entity.entityAspect.originalValues[prop];
                var newValue = entity.getProperty(prop);
                var text = String.format('{0} changed from <b><font color=red>{1}</font></b> to <b><font color=green>{2}</font></b>', prop, oldValue, newValue);
                //var text = prop + ' changed from ' + '<b>' + oldValue + '</b>' + ' to ' + newValue;
                details = details + text + '</br>';
            });
            return details;
        }
    }
})();
