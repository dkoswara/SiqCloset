(function () {
    'use strict';

    var serviceId = 'repository.item';

    angular.module('app').factory(serviceId, ['model', 'repository.abstract', 'zStorage', 'zStorageWip', RepositoryItem]);

    function RepositoryItem(model, AbstractRepository, zStorage, zStorageWip) {
        var EntityQuery = breeze.EntityQuery;
        var Predicate = breeze.Predicate;
        var entityName = model.modelInfo.Item.entityName;
        var resourceName = model.modelInfo.Item.resourceName;
        
        function Ctor(mgr) {
            this.serviceId = serviceId;
            this.entityName = entityName;
            this.manager = mgr;
            this.zStorage = zStorage;
            this.zStorageWip = zStorageWip;
            // Exposed data access functions
            this.getProjection = getProjection;
        }

        // Allow this repo to have access to the Abstract Repo
        // then put its own Ctor back on itself.
        //Ctor.prototype = new AbstractRepository(Ctor);
        //Ctor.prototype.constructor = Ctor;
        AbstractRepository.extend(Ctor);

        return Ctor;

        function getProjection(batchNumber) {
            var self = this;
            
            var predicate = Predicate.create('batch.batchID', '==', batchNumber);
            return EntityQuery.from(resourceName)
                .where(predicate)
                .select("box.boxNo, code, name, customer.name, customer.address, customer.phoneNo")
                .orderBy("box.boxNo")
                .using(self.manager).execute()
                .to$q(querySucceeded, self._queryFailed);

            function querySucceeded(data) {
                var results = data.results;
                self.log('Retrieved [Items Projection] from remote data source', results.length, true);
                return createItemsMap(results);
            }
            
            function createItemsMap(results) {
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
    }
})();