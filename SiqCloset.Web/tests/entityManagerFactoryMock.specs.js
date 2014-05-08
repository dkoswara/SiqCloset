'use strict';

ddescribe('the mocked entityManagerFactory', function() {

    var $rootScope;
    var mgr;

    beforeEach(function() {
        module('app');

        module(function($provide) {
            $provide.decorator('entityManagerFactory', entityManagerFactoryDecorator);

            function entityManagerFactoryDecorator($delegate) {
                // monkey patch the original 'newManager' with method that dresses up the result.
                var origNewManager = $delegate.newManager.bind($delegate);
                $delegate.newManager = newManager;
                return $delegate;
                //////////////////
                function newManager() {
                    var dataService = new breeze.DataService({
                        hasServerMetadata: false,
                        serviceName: '/mocked/'
                    });
                    var manager = origNewManager(dataService);

                    // Prime with metadata
                    manager.metadataStore.importMetadata(app.metadata);

                    // Prime with test data
                    manager.importEntities(testFns.customerTestData);

                    // prevent default queries from going remote;
                    setManagerToFetchFromCache(manager);

                    return manager;
                }

                /*******************************************************
                 * In sync tests we want queries to fetch from cache by default
                 *******************************************************/
                function setManagerToFetchFromCache(manager) {
                    manager.setProperties({
                        queryOptions: new breeze.QueryOptions({
                            // query the cache by default
                            fetchStrategy: breeze.FetchStrategy.FromLocalCache
                        })
                    });
                }

            }
        });

        inject(function (_$rootScope_, $httpBackend, entityManagerFactory) {
            $rootScope = _$rootScope_;
            $httpBackend.when('GET', 'app/dashboard/dashboard.html').respond(200);
            mgr = entityManagerFactory.newManager();
        });

    });

    iit('checks the serviceName', function() {
        expect(mgr.serviceName).toEqual('/mocked/');
    });

    it('should already have metadata from the import', function() {
        //expect(mgr.metadataStore.hasMetadataFor('breeze/Breeze/')).toBe(true);
        expect(mgr.metadataStore.isEmpty()).toBe(false);
    });

    it('should have customers in cache', function() {
        var query = breeze.EntityQuery.from('Customers');
        var customers = mgr.executeQueryLocally(query);
        expect(customers.length).toBeGreaterThan(0);
    });

    iit('should query customers from cache', function (done) {
        var query = breeze.EntityQuery.from('Customers');
        mgr.executeQuery(query).then(function (data) {
            var customers = data.results;
            expect(customers.length).toBeGreaterThan(0);
            done();
        });

        $rootScope.$digest();

    });
});