(function () {
    'use strict';

    var serviceId = 'repository.item';

    angular.module('app').factory(serviceId, ['model', 'repository.abstract', 'zStorage', 'zStorageWip', RepositoryItem]);

    function RepositoryItem(model, AbstractRepository, zStorage, zStorageWip) {
        var EntityQuery = breeze.EntityQuery;
        var Predicate = breeze.Predicate;
        var entityName = model.modelInfo.Item.entityName;
        var resourceName = model.modelInfo.Item.resourceName;
        var orderBy = 'box.boxNo';
        
        function Ctor(mgr) {
            this.serviceId = serviceId;
            this.entityName = entityName;
            this.manager = mgr;
            this.zStorage = zStorage;
            this.zStorageWip = zStorageWip;
            // Exposed data access functions
            this.create = create;
            this.getProjection = getProjection;
            this.getItems = getItems;
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
    }
})();