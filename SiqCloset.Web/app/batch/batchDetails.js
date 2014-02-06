(function () {
    'use strict';

    var controllerId = 'batchDetails';

    angular.module('app').controller(controllerId,
        ['$location', '$scope', '$routeParams', 'common', 'config', 'datacontext', batchDetails]);

    function batchDetails($location, $scope, $routeParams, common, config, datacontext) {
        var vm = this;
        var getLogFn = common.logger.getLogFn;
        var log = getLogFn(controllerId);
        var logError = getLogFn(controllerId, 'error');

        vm.items = [];
        vm.hasChanges = false;
        vm.isSaving = false;
        vm.save = save;
        vm.cancel = cancel;

        Object.defineProperty(vm, 'canSave', {
            get: canSave
        });

        Object.defineProperty(vm, 'canCancel', {
            get: canCancel
        });

        function canSave() { return vm.canCancel; }

        function canCancel() { return vm.hasChanges && !vm.isSaving; }

        activate();

        function activate() {
            onHasChanges();
            setItemsGrid();
            vm.batchID = $routeParams.id;
            common.activateController([getRequestedBatch()], controllerId)
               .then(function () {
                   log('Activated Customer Item List View');
               });
        }

        function getRequestedBatch() {
            var val = vm.batchID;
            return datacontext.item.getItems(val)
                .then(function (data) {
                    vm.items = data;
                }, function (error) {
                    logError('Unable to get batch ' + val);
                    goToBatches();
                });
        }

        function setItemsGrid() {
            $scope.itemsGridOptions = {
                data: 'vm.items',
                enableCellSelection: true,
                enableRowSelection: false,
                enableCellEdit: true,
                columnDefs: [
                    { field: 'notes', displayName: 'Notes', width: 150 },
                    { field: 'customer.name', displayName: 'Customer Name', width: 200 },
                    { field: 'code', displayName: 'Item Code', width: 100 },
                    { field: 'name', displayName: 'Item Name', width: 300 },
                    { field: 'box.boxNo', displayName: 'Box No', width: 75 },
                    { field: 'price', displayName: 'Price', width: 100 }
                ]
            };
        }

        function goToBatches() { $location.path('/batch'); }

        function onHasChanges() {
            $scope.$on(config.events.hasChangesChanged,
                function (event, data) {
                    vm.hasChanges = data.hasChanges;
                });
        }

        function save() {
            if (!canSave()) { return $q.when(null); }

            vm.isSaving = true;
            return datacontext.save()
                .then(function (saveResult) {
                    vm.isSaving = false;
                }, function (error) {
                    vm.isSaving = false;
                });
        }

        function cancel() {
            datacontext.cancel();
        }
    }
})();
