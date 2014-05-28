(function() {
    'use strict';
    
    var serviceId = 'entityManagerFactory';
    angular.module('app').factory(serviceId, ['breeze', 'config', 'model', emFactory]);

    function emFactory(breeze, config, model) {
        // Convert server-side PascalCase to client-side camelCase property names
        breeze.NamingConvention.camelCase.setAsDefault();

        // Do not validate when we attach a newly created entity to an EntityManager.
        // We could also set this per entityManager
        new breeze.ValidationOptions({ validateOnAttach: false }).setAsDefault();
        
        var serviceName = config.siqClosetRemoteServiceName;
        var metadataStore = createMetadataStore();

        var provider = {
            metadataStore: metadataStore,
            newManager: newManager
        };
        
        return provider;

        function newManager(val) {
            if (val) {
                //if val is defined, assume it's a breeze.DataService object
                return new breeze.EntityManager({ dataService: val });
            }

            // define the Breeze `DataService` for this app
            var dataService = new breeze.DataService({
                serviceName: serviceName,
                hasServerMetadata: false,  // don't ask the server for metadata
            });
            
            var mgr = new breeze.EntityManager({
                dataService: dataService,
                metadataStore: metadataStore,
            });
            return mgr;
        }

        function createMetadataStore() {
            var store = new breeze.MetadataStore();
            store.importMetadata(window.app.metadata);

            model.configureMetadataStore(store);
            extendMetadataWithDisplayName();

            return store;

            function extendMetadataWithDisplayName() {
                var md = JSON.parse(window.app.metadata);
                md.schema.entityType.forEach(function (et) {
                    var etype = store.getEntityType(et.name);
                    et.property.forEach(function (p) {
                        //Have to filter this way because at this point,
                        //prop name from original metadata is not camel-cased
                        var prop = etype.dataProperties.filter(function (dp) {
                            return dp.name.toLowerCase() == p.name.toLowerCase();
                        })[0];
                        prop.displayName = p.displayName;
                    });
                });
            }
        }
    }
})();