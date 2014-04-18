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
        vm.onCustomerSelect = onCustomerSelect;
        vm.onBoxSelect = onBoxSelect;
        vm.addNewBox = addNewBox;
        vm.addNewItem = addNewItem;

        Object.defineProperty(vm, 'canSave', {
            get: canSave
        });

        Object.defineProperty(vm, 'canCancel', {
            get: canCancel
        });

        Object.defineProperty(vm, 'canAddNewBox', {
            get: canAddNewBox
        });

        function canSave() { return vm.canCancel; }

        function canCancel() { return vm.hasChanges && !vm.isSaving; }

        function canAddNewBox() { return vm.items.length > 0; }

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
                vm.batchID = vm.batchID.substring(3);
                return 'Edit New Batch ' + vm.batchID;
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
                sortInfo: { fields: ['boxNo'], directions: ['asc'] },
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

        function createNewBox() {
            var nextBoxNo = 1;
            if (vm.boxes.length > 0) {
                var tempBox = underscore.max(vm.boxes, function(box) {
                    return box.boxNo;
                });
                nextBoxNo = tempBox.boxNo + 1;
            }
            var inits = {
                batchID: vm.batchID,
                boxID: breeze.core.getUuid(),
                boxNo: nextBoxNo,
            };
            return datacontext.box.create(inits);
        }

        function addNewBox() {
            var newBox = createNewBox();
            vm.boxes.push(newBox);
        }

        function addNewItem() {
            var inits = {
                itemID: breeze.core.getUuid(),
                batchID: vm.batchID,
            };
            var newItem = datacontext.item.create(inits);
            vm.items.push(newItem);
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
                .then(function(saveResult) {
                    vm.isSaving = false;
                    sortItems();
                }, function(error) {
                    vm.isSaving = false;
                });
        }

        function sortItems() {
            $scope.itemsGridOptions.sortInfo.columns[0].sortDirection = 'desc';
            $scope.itemsGridOptions.sortBy('boxNo');
        }

        function cancel() {
            datacontext.cancel();

            if (vm.newBatch && vm.newBatch.entityAspect.entityState.isDetached()) {
                goToBatches();
            } else {
                setCustName();
                setBoxNo();
                cleanupDetachedBoxes();
                cleanupDetachedItems();
            }
        }

        function cleanupDetachedBoxes() {
            vm.boxes.forEach(function (box) {
                var entityAspect = box.entityAspect;
                if (entityAspect && entityAspect.entityState.isDetached()) {
                    vm.boxes.pop(box);
                }
            });
        }

        function cleanupDetachedItems() {
            vm.items.forEach(function (item) {
                var entityAspect = item.entityAspect;
                if (entityAspect && entityAspect.entityState.isDetached()) {
                    vm.items.pop(item);
                }
            });
        }
    }
})();
