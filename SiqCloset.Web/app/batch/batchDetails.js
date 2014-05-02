(function () {
    'use strict';

    var controllerId = 'batchDetails';

    angular.module('app').controller(controllerId,
        ['$location', '$scope', '$routeParams', 'common', 'config', 'datacontext', 'bootstrap.dialog', 'model', batchDetails]);

    function batchDetails($location, $scope, $routeParams, common, config, datacontext, bsDialog, model) {
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
        var wipEntityKeys = [];

        vm.onCustomerSelect = onCustomerSelect;
        vm.onBoxSelect = onBoxSelect;
        vm.addNewBox = addNewBox;
        vm.addNewItem = addNewItem;
        vm.addNewCustomer = addNewCustomer;

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
            onDestroy();
            setItemsGrid();
            onEndEditCell();
            vm.batchID = $routeParams.id;
            common.activateController([getRequestedBatch()], controllerId)
               .then(function () {
                    onEveryChange();
                   log('Activated Customer Item List View');
               })
                .then(function () {
                   //one can navigate from WIP view to here
                   //which means hasChanges must be updated
                    vm.hasChanges = datacontext.hasChanges();

                    wipEntityKeys = datacontext.item.getItemsWipKeys(vm.items);
            });;
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
                return {
                    boxNo: item.box ? item.box.boxNo : null,
                    boxID: item.boxID
                };
            });

            var uniqueBoxes = underscore.unique(boxes, function (b) {
                return b.boxID;
            });

            vm.boxes = underscore.filter(uniqueBoxes, function(b) {
                return b.boxID != null;
            });
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
                enableCellSelection: true,
                enableRowSelection: true,
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
            if (!isCustomerLookupSelected) {
                resetCustomerName(row.entity);
            }
            isCustomerLookupSelected = false;

            setItemCodeToUppercase(row.entity);

            return true;

            function resetCustomerName(item) {
                if (item && item.customer) {
                    item.custName = item.customer.name;
                }
            }

            function setItemCodeToUppercase(item) {
                if (item && item.code) {
                    item.code = item.code.toUpperCase();
                }
            }
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

        function addNewCustomer() {
            bsDialog.inputDialog("Customer Name: ").then(createNewCustomer);

            function createNewCustomer(newCustomerName) {
                var inits = { customerID: breeze.core.getUuid(), name: newCustomerName };
                var newCust = datacontext.customer.create(inits);
                vm.customerLookups.push(newCust);    
            }
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
                    removeWipEntities();
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
            removeWipEntities();

            if (vm.newBatch && vm.newBatch.entityAspect.entityState.isDetached()) {
                goToBatches();
            } else {
                setCustName();
                setBoxNo();
                cleanupDetachedBoxes();
                cleanupDetachedItems();
                cleanupDetachedCustomers();
            }
        }

        function cleanupDetachedBoxes() {
            cleanupDetachedCore(vm.boxes);
        }

        function cleanupDetachedItems() {
            cleanupDetachedCore(vm.items);
        }

        function cleanupDetachedCustomers() {
            cleanupDetachedCore(vm.customerLookups);
        }

        function cleanupDetachedCore(arrays) {
            arrays.forEach(function (item) {
                var entityAspect = item.entityAspect;
                if (entityAspect && entityAspect.entityState.isDetached()) {
                    arrays.pop(item);
                }
            });
        }

        function storeWipEntity() {
            var selectedItem = vm.selectedItems[0];
            if (!selectedItem) return;

            var itemID = selectedItem.itemID;
            var description = selectedItem.code || '[New Item]' + itemID;

            var tempKey = findExistingKey(wipEntityKeys, itemID) || {};
            if (underscore.isEmpty(tempKey)) {
                wipEntityKeys.push(tempKey);
            }

            tempKey[itemID] = datacontext.zStorageWip.storeWipEntity(
                selectedItem,
                itemID,
                tempKey[itemID],
                model.modelInfo.Item.entityName,
                description,
                model.modelInfo.Batch.entityName.toLowerCase() + '/' + selectedItem.batchID);

            function findExistingKey(weks, id) {
                return underscore.find(weks, function(x) {
                    var key = Object.keys(x)[0];
                    return key == id;
                });
            }
        }

        function autoStoreWip(immediate) {
            common.debouncedThrottle(controllerId, storeWipEntity, 1000, immediate);
        }

        function onEveryChange() {
            $scope.$on(config.events.entitiesChanged, function (event, data) {
                autoStoreWip();
            });
        }

        function onDestroy() {
            $scope.$on('$destroy', function () {
                autoStoreWip(true);
                datacontext.cancel();
            });
        }

        function removeWipEntities() {
            wipEntityKeys.forEach(function (wipEntityKey) {
                var key = Object.keys(wipEntityKey)[0];
                var wipKey = wipEntityKey[key];
                datacontext.zStorageWip.removeWipEntity(wipKey);
            });
        }
    }
})();
