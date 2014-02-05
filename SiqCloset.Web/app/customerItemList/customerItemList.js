(function () {
    'use strict';

    var controllerId = 'customerItemList';

    angular.module('app').controller(controllerId,
        ['$scope', '$routeParams', 'common','datacontext', customerItemList]);

    function customerItemList($scope, $routeParams, common, datacontext) {
        var vm = this;
        var getLogFn = common.logger.getLogFn;
        var log = getLogFn(controllerId);

        vm.title = 'Customer Item List';
        vm.items = [];

        activate();

        function activate() {
            setItemsGrid();
            vm.batchID = $routeParams.id;
            common.activateController([getRequestedBatch()], controllerId)
               .then(function () {
                   log('Activated Customer Item List View');
               });
        }

        function getRequestedBatch() {
            var val = vm.batchID;
            return datacontext.item.getProjection(val)
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
                columnDefs: [
                    { field: 'notes', displayName: 'Notes', width: 150 },
                    { field: 'custName', displayName: 'Customer Name', width: 200 },
                    { field: 'itemCode', displayName: 'Item Code', width: 100 },
                    { field: 'itemName', displayName: 'Item Name', width: 200 },
                    { field: 'boxNo', displayName: 'Box No', width: 75 },
                    { field: 'price', displayName: 'Price', width: 100 }
                ]
            };
        }

        function goToBatches() { $location.path('/batches'); }

        
    }
})();
