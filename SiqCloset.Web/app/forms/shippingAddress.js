(function () {
    'use strict';

    var controllerId = 'shippingAddress';

    angular.module('app').controller(controllerId,
        ['$scope', 'common','datacontext','config', shippingAddress]);

    function shippingAddress($scope, common, datacontext, config) {
        var vm = this;
        var getLogFn = common.logger.getLogFn;
        var log = getLogFn(controllerId);
        var keyCodes = config.keyCodes;

        vm.title = 'Shipping Address';
        vm.items = [];
        vm.batchInput = '';
        vm.getItemsFromBatch = getItemsFromBatch;
        
        activate();

        function activate() {
            setItemsGrid();
            common.activateController([], controllerId)
               .then(function () {
                   log('Activated Shipping Address View');
               });
        }

        function setItemsGrid() {
            $scope.itemsGridOptions = {
                data: 'vm.items',
                columnDefs: [
                    { field: 'boxNo', displayName: 'Box No', width: 75 },
                    { field: 'itemCode', displayName: 'Item Code', width: 100 },
                    { field: 'itemName', displayName: 'Item Name', width: 200 },
                    { field: 'custName', displayName: 'Customer Name', width: 200 },
                    { field: 'custAddress', displayName: 'Customer Address' },
                    { field: 'custPhoneNo', displayName: 'Customer Phone No', width: 150 }
                ]
            };
        }
        
        function getItemsFromBatch($event) {
            if ($event.keyCode === keyCodes.esc) {
                vm.batchInput = '';
            }

            if ($event.type === 'click' || $event.keyCode === keyCodes.enter) {
                datacontext.item.getProjection(vm.batchInput).then(function(data) {
                    vm.items = data;
                });
            }
        }
    }
})();
