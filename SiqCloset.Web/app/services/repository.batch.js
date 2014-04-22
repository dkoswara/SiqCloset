(function () {
    'use strict';

    var serviceId = 'repository.batch';

    
    angular.module('app').factory(serviceId, ['model', 'repository.abstract', 'zStorage', RepositoryBatch]);

    function RepositoryBatch(model, AbstractRepository, zStorage) {
        var EntityQuery = breeze.EntityQuery;
        var Predicate = breeze.Predicate;
        var entityName = model.modelInfo.Batch.entityName;
        var resourceName = model.modelInfo.Batch.resourceName;
        var orderBy = 'batchID';

        function Ctor(mgr) {
            this.serviceId = serviceId;
            this.entityName = entityName;
            this.manager = mgr;
            this.zStorage = zStorage;

            // Exposed data access functions
            this.create = create;
            this.getPartials = getPartials;
            this.getCount = getCount;
        }

        // Allow this repo to have access to the Abstract Repo
        // then put its own Ctor back on itself.
        //Ctor.prototype = new AbstractRepository(Ctor);
        //Ctor.prototype.constructor = Ctor;
        AbstractRepository.extend(Ctor);

        return Ctor;

        function create(batchNumber) {
            return this.manager.createEntity(entityName, { batchID: batchNumber });
        }

        function getPartials(forceRefresh) {
            var self = this;
            var batches;

            if (self.zStorage.areItemsLoaded(resourceName) && !forceRefresh) {
                batches = self._getAllLocal(resourceName, orderBy);
                return self.$q.when(batches);
            }

            return EntityQuery.from(resourceName)
                .select('batchID')
                .orderBy(orderBy)
                .toType(entityName)
                .using(self.manager).execute()
                .then(querySucceeded, self._queryFailed);

            function querySucceeded(data) {
                self.zStorage.areItemsLoaded(resourceName, true);
                batches = self._setIsPartialTrue(data.results);
                self.log('Retrieved [Batches] from remote data source', batches.length, true);
                return batches;
            }
        }

        function getCount() {
            return EntityQuery.from(resourceName)
                .take(0).inlineCount(true)
                .using(this.manager).execute()
                .then(this._getInlineCount);
        }

       
    }
})();