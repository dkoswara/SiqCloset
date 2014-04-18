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
    }
})();