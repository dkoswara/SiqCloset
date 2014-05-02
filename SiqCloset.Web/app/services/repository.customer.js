(function () {
    'use strict';

    var serviceId = 'repository.customer';

    angular.module('app').factory(serviceId, ['model', 'model.validation', 'repository.abstract', 'zStorage', 'zStorageWip', RepositoryCustomer]);

    function RepositoryCustomer(model, modelValidation, AbstractRepository, zStorage, zStorageWip) {
        var EntityQuery = breeze.EntityQuery;
        var EntityState = breeze.EntityState;
        var Predicate = breeze.Predicate;
        var underscore = _;
        var entityName = model.modelInfo.Customer.entityName;
        var resourceName = model.modelInfo.Customer.resourceName;
        var orderBy = 'name';
        
        function Ctor(mgr) {
            this.serviceId = serviceId;
            this.entityName = entityName;
            this.manager = mgr;
            this.zStorage = zStorage;
            this.zStorageWip = zStorageWip;
            // Exposed data access functions
            this.create = create;
            this.createNullo = createNullo;
            this.applyCustomerValidation = applyCustomerValidation;
            this.getAll = getAll;
            this.getAllLocal = getAllLocal;
            this.getById = getById;
            this.getPartials = getPartials;
            this.getCount = getCount;
            this.getCustomersAndItemsCount = getCustomersAndItemsCount;
            this.getLocalFromManager = getLocalFromManager;
            this.getCustomerByName = getCustomerByName;
            this.getCustomerChangesCount = getCustomerChangesCount;
        }

        // Allow this repo to have access to the Abstract Repo
        // then put its own Ctor back on itself.
        //Ctor.prototype = new AbstractRepository(Ctor);
        //Ctor.prototype.constructor = Ctor;
        AbstractRepository.extend(Ctor);

        return Ctor;

        function create(inits) {
            if (inits) {
                return this.manager.createEntity(entityName, inits);
            }
            return this.manager.createEntity(entityName, { customerID: breeze.core.getUuid() });
        }
        
        function createNullo() {
            return model.createNullos(this.manager);
        }

        function applyCustomerValidation() {
            modelValidation.createAndRegister(entityName, this.manager);
        }

        function getAll() {
            var self = this;
            var customers;

            var storageEnabledAndHasData = self.zStorage.load(self.manager);
            if (storageEnabledAndHasData || self.zStorage.areItemsLoaded(resourceName)) {
                return self.$q.when(self.getAllLocal());
            }
           
            return EntityQuery.from(resourceName)
                .orderBy(orderBy)
                .toType(entityName)
                .using(self.manager).execute()
                .then(querySucceeded, self._queryFailed);

            function querySucceeded(data) {
                self.zStorage.areItemsLoaded(resourceName, true);
                customers = data.results;
                self.log('Retrieved [Customers] from remote data source', customers.length, true);
                self.zStorage.save();
                return customers;
            }
        }

        function getAllLocal() {
            return this._getAllLocal(resourceName, orderBy);
        }
        
        function getById(id, forceRemote) {
            return this._getById(entityName, id, forceRemote);
        }
        
        function getPartials(forceRefresh) {
            var self = this;
            var customers;
            
            if (self.zStorage.areItemsLoaded(resourceName) && !forceRefresh) {
                customers = self._getAllLocal(resourceName, orderBy);
                return self.$q.when(customers);
            }

            return EntityQuery.from(resourceName)
                .select('customerID, name')
                .orderBy(orderBy)
                .toType(entityName)
                .using(self.manager).execute()
                .then(querySucceeded, self._queryFailed);

            function querySucceeded(data) {
                self.zStorage.areItemsLoaded(resourceName, true);
                customers = self._setIsPartialTrue(data.results);
                self.log('Retrieved [Customers] from remote data source', customers.length, true);
                return customers;
            }
        }
        
        function getCount() {
            return EntityQuery.from(resourceName)
                .take(0).inlineCount(true)
                .using(this.manager).execute()
                .then(this._getInlineCount);
        }
        
        function getCustomersAndItemsCount() {
            var self = this;
            
            return EntityQuery.from(resourceName)
                .select("name, items")
                .orderBy('items.length')
                .take(10)
                .using(self.manager).execute()
                .then(querySucceeded, self._queryFailed);

            function querySucceeded(data) {
                var results = data.results;
                self.log('Retrieved [Customers and Items count] from remote data source', results.length, true);
                var customersMap = [];
                results.forEach(function (d) {
                    var customer = { name: '', itemsCount: 0 };
                    customer.name = d.name;
                    customer.itemsCount = d.items.length;
                    customersMap.push(customer);
                });
                return customersMap;
            }
        }
        
        function getLocalFromManager(em) {
            if (!em) em = this.manager;
            return EntityQuery.from(resourceName)
                .select('customerID, name, address, phoneNo')
                .orderBy(orderBy)
                .toType(entityName)
                .using(em)
                .executeLocally();
        }

        function getCustomerByName(custName) {
            var self = this;
            var results = EntityQuery.from(resourceName)
                .where('name', '==', custName)
                .toType(entityName)
                .using(self.manager)
                .executeLocally();
            return results[0];
        }

        function getCustomerChangesCount() {
            var manager = this.manager;

            var addedCustomers = manager.getEntities(entityName, EntityState.Added);
            var modifiedCustomers = manager.getEntities(entityName, EntityState.Modified);

            return { added: addedCustomers.length, modified: modifiedCustomers.length };
        }
        
        function deleteAllCustomers() {
            var self = this;
            
            EntityQuery.from(resourceName)
                .toType(entityName)
                .using(self.manager).execute()
                .then(querySucceeded, self._queryFailed);

            function querySucceeded(data) {
                var customers = data.results;
                customers.forEach(function (c) {
                    c.entityAspect.setDeleted();
                });

                self.manager.saveChanges()
                    .then(saveSucceeded)
                    .fail(saveFailed);
            }

            function saveSucceeded(saveResult) {
                self.log('Delete all customers successful', saveResult.entities.length, true);
            }
            
            function saveFailed(error) {
                var msg = config.appErrorPrefix + 'Error saving changes.' + error.message;
                self.logError(msg, error);
                throw error;
            }
        }
        
    }
})();