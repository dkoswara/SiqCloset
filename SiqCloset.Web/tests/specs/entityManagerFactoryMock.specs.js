'use strict';

describe('the mocked entityManagerFactory', function() {

    var $rootScope;
    var mgr;

    beforeEach(function() {
        testFns.prepareAppModuleForTest();

        inject(function (_$rootScope_, entityManagerFactory) {
            $rootScope = _$rootScope_;
            mgr = entityManagerFactory.newManager();
        });
    });

    it('checks the serviceName', function() {
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

    it('should query customers from cache', function (done) {
        var query = breeze.EntityQuery.from('Customers');
        mgr.executeQuery(query).then(function (data) {
            var customers = data.results;
            expect(customers.length).toBeGreaterThan(0);
            done();
        });

        $rootScope.$digest();

    });
});