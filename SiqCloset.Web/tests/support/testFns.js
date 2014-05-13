var testFns = (function () {
    'use strict';

    var fns = {
        prepareAppModuleForTest: prepareAppModuleForTest,
        prepareMockedEntityManager: prepareMockedEntityManager,
        mockHttpReq: mockHttpReq,
    };

    return fns;

    function prepareAppModuleForTest() {
        module('app');

        prepareMockedEntityManager();

        mockHttpReq();
    }

    function prepareMockedEntityManager() {
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
    }

    function mockHttpReq() {
        
        inject(function ($httpBackend) {
            //mock any breeze request
            $httpBackend.whenGET(/^breeze\/Breeze/).respond(200);
            //mock any html request
            $httpBackend.whenGET(/^app.*?\.html$/).respond(200);
        });
    }
})();