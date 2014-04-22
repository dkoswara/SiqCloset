(function () {
    'use strict';
	
    var serviceId = 'repository.abstract';
	
    angular.module('app').factory(serviceId, ['common', 'config', AbstractRepository]);

    function AbstractRepository(common, config) {
        var EntityQuery = breeze.EntityQuery;
        var logError = common.logger.getLogFn(this.serviceId, 'error');

        // Abstract repo gets its derived object's this.manager
        function Ctor() {
            this.isLoaded = false;
        }

        Ctor.extend = function(repoCtor) {
            // Allow this repo to have access to the Abstract Repo's functions,
            //then put its own Ctor back on itself.
        	//See http://www.johnpapa.net/protoctor/
            repoCtor.prototype = new Ctor();
            repoCtor.prototype.constructor = repoCtor;
        };
        
    	// Shared by repository classes
        Ctor.prototype._getAllLocal = _getAllLocal;
        Ctor.prototype._getById = _getById;
        Ctor.prototype.getEntityByIdLocal = getEntityByIdLocal;
        Ctor.prototype.getEntityByIdOrFromWip = getEntityByIdOrFromWip;
        Ctor.prototype._setIsPartialTrue = _setIsPartialTrue;
        Ctor.prototype._getInlineCount = _getInlineCount;
        Ctor.prototype._getLocalEntityCount = _getLocalEntityCount;
        Ctor.prototype._queryFailed = _queryFailed;
        
    	// Convenience functions for the Repos
        Ctor.prototype.log = common.logger.getLogFn(this.serviceId);
        Ctor.prototype.logError = common.logger.getLogFn(this.serviceId, 'error');
        Ctor.prototype.$q = common.$q;

        return Ctor;
        
        function _getAllLocal(resource, ordering, predicate) {
        	return EntityQuery.from(resource)
                .orderBy(ordering)
                .where(predicate)
                .using(this.manager)
                .executeLocally();
        }
        
        function _getLocalEntityCount(resource) {
        	var entities = EntityQuery.from(resource)
                .using(this.manager)
                .executeLocally();
        	return entities.length;
        }
        
        function _getInlineCount(data) { return data.inlineCount; }
        
        function _queryFailed(error) {
        	var msg = config.appErrorPrefix + 'Error retrieving data.' + error.message;
        	logError(msg, error);
        	throw error;
        }
        
		function _getById(entityName, id, forceRemote) {
			var self = this;
			var manager = self.manager;
		    if (!forceRemote) {
		    	// check cache first
		    	var entity = manager.getEntityByKey(entityName, id);
		        if (entity && !entity.isPartial) {
		            self.log('Retrieved [' + entityName + '] id:' + _getEntityKey(entity) + ' from cache.', entity, true);
		            if (entity.entityAspect.entityState.isDeleted()) {
		                entity = null;
		            }
		            return self.$q.when(entity);
		        }
		    }
		    
			//Hit the server
			//It was not found in cache, so let's query for it.
		    return manager.fetchEntityByKey(entityName, id)
		        .to$q(querySucceeded, self._queryFailed);
		    
			function querySucceeded(data) {
				entity = data.entity;
			    if (!entity) {
			    	self.log('Could not find [' + entityName + '] id:' + id, null, true);
			        return null;
			    }
			    entity.isPartial = false;
			    self.log('Retrieved [' + entityName + '] id ' + _getEntityKey(entity) + ' from remote data source', entity, true);
			    self.zStorage.save();
			    return entity;
			}
		}

		function getEntityByIdLocal(id) {
		    return this.manager.getEntityByKey(this.entityName, id);
		}

		function getEntityByIdOrFromWip(val) {
            //First check WIP in local storage
		    var wipEntityKey = this.zStorageWip.findWipKeyByEntityId(this.entityName, val);
            //If not in WIP, go to Breeze
		    if (!wipEntityKey) {
                return this._getById(this.entityName, val);
		    }

		    //If we got a WIP key back, load it from WIP
		    var importedEntity = this.zStorageWip.loadWipEntity(wipEntityKey);
            if (importedEntity) {
                importedEntity.entityAspect.validateEntity();
                return this.$q.when({ entity: importedEntity, key: wipEntityKey });
            }

            //If we reach here, there is a problem
		    return this.$q.reject({ error: 'Couldn\'t find the entity for WIP key ' + wipEntityKey });

		}
        
        function _getEntityKey(entity) {
            return entity.entityAspect.getKey().values[0];
        }
        
        function _setIsPartialTrue(entities) {
            entities.forEach(function(e) {
                e.isPartial = true;
            });
            return entities;
        }
    }
})();