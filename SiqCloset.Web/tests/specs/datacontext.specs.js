'use strict';

ddescribe('the datacontext', function () {

    var datacontext;
    var $rootScope;

    beforeEach(function() {
        module('app');

        module(function ($provide) {
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

        inject(function(_$rootScope_, _datacontext_) {
            $rootScope = _$rootScope_;
            datacontext = _datacontext_;
        });

        testFns.mockHttpReq();

    });

    it('should pass', function() {
        expect(true).toBe(true);
    });

    it('should get initialized with mocked entityManager', function() {
        pending();
    });

    iit('should have customers in cache', function() {
        var customers = datacontext.customer.getAllLocal();
        expect(customers.length).toBeGreaterThan(0);
    });

    iit('should be able to query customers', function (done) {
        
        datacontext.customer.getAll().then(function (results) {
            var customers = results;
            expect(customers.length).toBeGreaterThan(0);
            done();
        });

        $rootScope.$digest();

    });
});