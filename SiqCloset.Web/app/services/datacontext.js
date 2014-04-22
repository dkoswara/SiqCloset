(function () {
    'use strict';

    var serviceId = 'datacontext';
    angular.module('app').factory(serviceId,
        ['$rootScope', 'common', 'entityManagerFactory','config','repositories', 'zStorage', 'zStorageWip', datacontext]);

    function datacontext($rootScope, common, emFactory, config, repositories, zStorage, zStorageWip) {
        var $q = common.$q;
        var manager = emFactory.newManager();
        var EntityQuery = breeze.EntityQuery;
        var getLogFn = common.logger.getLogFn;
        var log = getLogFn(serviceId);
        var logError = getLogFn(serviceId, 'error');
        var logSuccess = getLogFn(serviceId, 'success');
        var repoNames = ['customer', 'item', 'batch', 'box'];
        var events = config.events;
        var primePromise;

        var service = {
            prime: prime,
            save: save,
            cancel: cancel,
            markDeleted: markDeleted,
            zStorage: zStorage,
            zStorageWip: zStorageWip,
        };
        
        init();

        return service;
       
        function init() {
            zStorage.init(manager);
            zStorageWip.init(manager);
            listenForStorageEvents();
            repositories.init(manager);
            defineLazyLoadedRepos();
            setupEventForEntitiesChanged();
            setupEventForHasChangesChanged();
        }

        function listenForStorageEvents() {
            $rootScope.$on(config.events.storage.storeChanged, function(event, data) {
                log('Updated local storage', data, true);
            });
            $rootScope.$on(config.events.storage.wipChanged, function (event, data) {
                log('Updated WIP', data, true);
            });
            $rootScope.$on(config.events.storage.error, function (event, data) {
                log('Error with local storage' + data.activity, data, true);
            });
        }

        // Add ES5 property to datacontext for each named repo
        function defineLazyLoadedRepos() {
            repoNames.forEach(function (name) {
                Object.defineProperty(service, name, {
                    configurable: true, //will redefine this property once
                    get: function () {
                        // The 1st time the repo is requested via this property,
                        // we ask the repositories for it (which will inject it).
                        var repo = repositories.getRepo(name);
                        // Rewrite this property to always return this repo;
                        // no longer redefinable
                        Object.defineProperty(service, name, {
                            value: repo,
                            configurable: false,
                            enumerable: true,
                        });
                        return repo;
                    }
                });
            });
        }

        function cancel() {
            if (manager.hasChanges()) {
                manager.rejectChanges();
                logSuccess('Cancelled changes', null, true);
            }
        }

        function markDeleted(entity) {
            return entity.entityAspect.setDeleted();
        }

        function save(entitiesToSave, saveLocalStorage) {
            return manager.saveChanges(entitiesToSave || null)
                .then(saveSucceeded, saveFailed);

            function saveSucceeded(saveResult) {
                saveLocalStorage = saveLocalStorage || true;
                if (saveLocalStorage) zStorage.save();
                logSuccess('Saved data', saveResult, true);
            }

            function saveFailed(error) {
                var msg = config.appErrorPrefix + 'Save failed: ' +
                    breeze.saveErrorMessageService.getErrorMessage(error);
                error.message = msg;
                logError(msg, error);
                throw error;
            }
            
        }

        function setupEventForEntitiesChanged() {
            manager.entityChanged.subscribe(function(changeArgs) {
                if (changeArgs.entityAction === breeze.EntityAction.PropertyChange) {
                    interceptPropertyChange(changeArgs);
                    common.$broadcast(events.entitiesChanged, changeArgs);
                }
            });
        }

        // Forget certain changes by removing them from the entity's originalValues map
        // This function becomes unnecessary if Breeze decides that
        // unmapped properties are not recorded in originalValues map
        //
        // We do this so we can remove the isPartial properties from
        // the originalValues of an entity. Otherwise, when the object's changes
        // are canceled these values will also reset: isPartial will go
        // from false to true, and force the controller to refetch the
        // entity from the server.
        // Ultimately, we do not want to track changes to these properties,
        // so we remove them.

        function interceptPropertyChange(changeArgs) {
            var changeProp = changeArgs.args.propertyName;
            if (changeProp === 'isPartial') {
                delete changeArgs.entity.entityAspect.originalValues[changeProp];
            }
        }

        function setupEventForHasChangesChanged() {
            manager.hasChangesChanged.subscribe(function(eventArgs) {
                var data = { hasChanges: eventArgs.hasChanges };
                // send the message (the ctrl receives it)
                common.$broadcast(events.hasChangesChanged, data);
            });
        }

        function prime() {
            if (primePromise) return primePromise;

            primePromise = $q.all([service.customer.getAll()])
                .then(extendMetadata)
                .then(success);

            return primePromise;

            function extendMetadata() {
                var metadataStore = manager.metadataStore;
            }

            function success() {
                log('Primed the data');
            }
        }

    }
})();