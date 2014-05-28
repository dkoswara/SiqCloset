(function () {
    'use strict';

    var serviceId = 'repository.box';

    // TODO: replace app with your module name
    angular.module('app').factory(serviceId, ['model', 'repository.abstract', 'zStorage', RepositoryBox]);

    function RepositoryBox(model, AbstractRepository, zStorage) {
    	var EntityQuery = breeze.EntityQuery;
    	var Predicate = breeze.Predicate;
    	var entityName = model.modelInfo.Box.entityName;
    	var resourceName = model.modelInfo.Box.resourceName;
    	var orderBy = 'boxNo';

    	function Ctor(mgr) {
    		this.serviceId = serviceId;
    		this.entityName = entityName;
    		this.manager = mgr;
    		this.zStorage = zStorage;

    		// Exposed data access functions
    		this.create = create;
	        this.getAll = getAll;
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

    	function getAll() {
    	    var self = this;
    	    var boxes;

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
    	        boxes = data.results;
    	        self.log('Retrieved [Boxes] from remote data source', boxes.length, true);
    	        self.zStorage.save();
    	        return boxes;
    	    }
    	}
    }
})();