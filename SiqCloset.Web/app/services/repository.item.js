(function () {
    'use strict';

    var serviceId = 'repository.item';

    angular.module('app').factory(serviceId, ['model', 'repository.abstract', 'zStorage', 'zStorageWip', RepositoryItem]);

    function RepositoryItem(model, AbstractRepository, zStorage, zStorageWip) {
        var EntityQuery = breeze.EntityQuery;
        var Predicate = breeze.Predicate;
        var underscore = _;
        var entityName = model.modelInfo.Item.entityName;
        var resourceName = model.modelInfo.Item.resourceName;
        var customerResourceName = model.modelInfo.Customer.resourceName;
        var orderBy = 'box.boxNo';
        
        function Ctor(mgr) {
            this.serviceId = serviceId;
            this.entityName = entityName;
            this.manager = mgr;
            this.zStorage = zStorage;
            this.zStorageWip = zStorageWip;
            // Exposed data access functions
            this.create = create;
            this.createBatchBoxItem = createBatchBoxItem;
            this.getProjection = getProjection;
            this.getItems = getItems;
            this.getItemsWipKeys = getItemsWipKeys;
        }

        // Allow this repo to have access to the Abstract Repo
        // then put its own Ctor back on itself.
        //Ctor.prototype = new AbstractRepository(Ctor);
        //Ctor.prototype.constructor = Ctor;
        AbstractRepository.extend(Ctor);

        return Ctor;

        function create(inits) {
            return this.manager.createEntity(entityName, inits);
        }

        function getProjection(batchNumber) {
            var self = this;
            
            var predicate = Predicate.create('batch.batchID', '==', batchNumber);
            return EntityQuery.from(resourceName)
                .where(predicate)
                .select('box.boxNo, code, name, customer.name, customer.address, customer.phoneNo')
                .orderBy(orderBy)
                .using(self.manager).execute()
                .then(querySucceeded, self._queryFailed);

            function querySucceeded(data) {
                var results = data.results;
                self.log('Retrieved [Items Projection] from remote data source', results.length, true);
                return createItemsArray(results);
            }
            
            function createItemsArray(results) {
                var itemsMap = [];
                results.forEach(function (r) {
                    var item = {
                        boxNo: 0,
                        itemCode: '',
                        itemName: '',
                        custName: '',
                        custAddress: '',
                        custPhoneNo: '',
                    };
                    item.boxNo = r.box_BoxNo;
                    item.itemCode = r.code;
                    item.itemName = r.name;
                    item.custName = r.customer_Name;
                    item.custAddress = r.customer_Address;
                    item.custPhoneNo = r.customer_PhoneNo;

                    itemsMap.push(item);
                });
                return itemsMap;
            }
        }

        function createBatchBoxItem(batchNumber, custItemLists) {
            var self = this;
            var manager = self.manager;

            var newBatch = manager.createEntity('Batch', { batchID: batchNumber });

            var boxes = underscore.groupBy(custItemLists, 'BoxNo');

            for (var boxNo in boxes) {
                var newBox = undefined;
                if (boxNo != 0) {
                    newBox = manager.createEntity('Box', {
                        boxID: breeze.core.getUuid(),
                        boxNo: boxNo,
                        batchID: newBatch.batchID,
                    });
                }
                var newBoxID = newBox ? newBox.boxID : null;

                underscore.forEach(boxes[boxNo], function (box) {
                    manager.createEntity(entityName, {
                        itemID: breeze.core.getUuid(),
                        code: box.ItemCode,
                        name: box.ItemName,
                        price: box.Price,
                        notes: box.Notes,
                        boxID: newBoxID,
                        batchID: newBatch.batchID,
                        customerID: getCustomerId(box.CustomerName),

                        //unmapped property
                        custName: box.CustomerName,
                    });
                });
            }

            var storeMetaKey = resourceName + "_" + batchNumber;
            self.zStorage.areItemsLoaded(storeMetaKey, true);
            return newBatch;

            function getCustomerId(custName) {
                var query = EntityQuery.from(customerResourceName)
                    .where('name', '==', custName)
                    .select('customerID');

                var ids = manager.executeQueryLocally(query); // query the cache (synchronous)
                if (ids.length == 0) {
                    return null;
                }
                return ids[0].customerID;    //should only have one match
            }
        }

        function getItems(batchNumber) {
            var self = this;
            var results;
            var storeMetaKey = resourceName + "_" + batchNumber;
            var predicate = Predicate.create('batch.batchID', '==', batchNumber);

            if (self.zStorage.areItemsLoaded(storeMetaKey)) {
                results = self._getAllLocal(resourceName, orderBy, predicate);
                self.log('Retrieved [Items Details] from cache', results.length, true);
                return self.$q.when(results);
            }

            return EntityQuery.from(resourceName)
                .where(predicate)
                .orderBy(orderBy)
                .expand('customer, box, batch')
                .toType(entityName)
                .using(self.manager).execute()
                .then(querySucceeded, self._queryFailed);

            function querySucceeded(data) {
                self.zStorage.areItemsLoaded(storeMetaKey, true);
                results = data.results;
                self.log('Retrieved [Items Details] from remote data source', results.length, true);
                return results;
            }
        }

        function getItemsWipKeys(items) {
            var self = this;

            var wipEntityKeys = [];
            items.forEach(function (item) {
                var itemID = item.itemID;
                var wipEntityKey = {};
                var wipKey = self.zStorageWip.findWipKeyByEntityId(self.entityName, itemID);
                if (wipKey) {
                    wipEntityKey[itemID] = wipKey;
                    wipEntityKeys.push(wipEntityKey);
                }
            });

            return wipEntityKeys;
        }
    }
})();