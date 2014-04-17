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
        var underscore = _;

        vm.getTitle = getTitle;
        vm.customerLookups = [];
        vm.items = [];
        vm.selectedItems = [];
        vm.hasChanges = false;
        vm.isSaving = false;
        vm.save = save;
        vm.cancel = cancel;
        vm.boxes = [];

        var isCustomerLookupSelected = false;

        vm.selected = undefined;
        vm.states = ['Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut', 'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa', 'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan', 'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada', 'New Hampshire', 'New Jersey', 'New Mexico', 'New York', 'North Dakota', 'North Carolina', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island', 'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont', 'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'];
        vm.onCustomerSelect = onCustomerSelect;
        vm.onBoxSelect = onBoxSelect;

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
            getCustomerLookups();
            onHasChanges();
            setItemsGrid();
            onEndEditCell();
            vm.batchID = $routeParams.id;
            common.activateController([getRequestedBatch()], controllerId)
               .then(function () {
                   log('Activated Customer Item List View');
               });
        }

        function getTitle() {
            if (vm.batchID.lastIndexOf('new') != -1) {
                var newBatchID = vm.batchID.substring(3);
                return 'Edit New Batch ' + newBatchID;
            }
            return 'Edit Batch ' + vm.batchID;
        }

        function getCustomerLookups() {
            vm.customerLookups = datacontext.customer.getLocalFromManager();
        }

        function getRequestedBatch() {
            var val = vm.batchID;
            if (val.lastIndexOf('new') != -1) {
                vm.newBatch = datacontext.batch.create(vm.batchID.substring(3));
                return vm.items = [];
            }

            return datacontext.item.getItems(val)
                .then(querySucceeded, queryFailed);

            function querySucceeded(data) {
                vm.items = data;
                setCustName();
                setBoxNo();
                getBoxes(vm.items);
            }

            function queryFailed(error) {
                logError('Unable to get batch ' + val);
                goToBatches();
            }
        }

        function getBoxes(items){
            //var boxes = [];

            //underscore.map(items, function (item) {
            //    boxes[item.box.boxNo] = item.boxID;
            //});

            var boxes = underscore.map(items, function (item) {
                return { boxNo: item.box.boxNo, boxID: item.boxID };
            });

            var uniqueBoxes = underscore.unique(boxes, function (b) {
                return b.boxID;
            });

            vm.boxes = uniqueBoxes;
        }

        function setCustName() {
            vm.items.forEach(function (i) {
                if (i.customer) {
                    i.custName = i.customer.name;
                }
            });
        }

        function setBoxNo() {
            vm.items.forEach(function (i) {
                if (i.box) {
                    i.boxNo = i.box.boxNo;
                }
            });
        }

        function setItemsGrid() {
            $scope.itemsGridOptions = {
                data: 'vm.items',
                selectedItems: vm.selectedItems,
                multiSelect: false,
                enableCellEdit: true,
                beforeSelectionChange: beforeSelectionChange,
                columnDefs: [
                    { field: 'notes', displayName: 'Notes', width: 150 },
                    {
                        field: 'custName', displayName: 'Customer Name', width: 215,
                        cellTemplate: '/app/batch/custSelTmplTypeAhead.html', enableCellEdit: false
                    },
                    { field: 'code', displayName: 'Item Code', width: 100 },
                    { field: 'name', displayName: 'Item Name', width: 300 },
                    { 
                        field: 'boxNo', displayName: 'Box No', width: 75,
                        cellTemplate: '/app/batch/boxSelTmplDropDown.html', enableCellEdit: false 
                    },
                    { field: 'price', displayName: 'Price', width: 85 }
                ]
            };
        }

        function beforeSelectionChange(row) {
            if(!isCustomerLookupSelected) {
                var item = vm.selectedItems[0];
                if(item && item.customer){
                    item.custName = item.customer.name;
                }
            }
            isCustomerLookupSelected = false;
            return true;
        }
        

        function onEndEditCell() {
            $scope.$on('ngGridEventEndCellEdit', function (evt) {
                var entity = evt.targetScope.row.entity;
            });
        }

        function onCustomerSelect($item, $model, $label) {
            vm.selectedItems[0].customerID = $item.customerID;
            isCustomerLookupSelected = true;
        };

        function onBoxSelect(boxNo) {
            var selectedBox = underscore.find(vm.boxes, function(box) {
                return box.boxNo == boxNo;
            });
            vm.selectedItems[0].boxID = selectedBox.boxID;
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

            if (vm.newBatch && vm.newBatch.entityAspect.entityState.isDetached()) {
                goToBatches();
            } else {
                setCustName();
                setBoxNo();
            }


        }
    }
})();
