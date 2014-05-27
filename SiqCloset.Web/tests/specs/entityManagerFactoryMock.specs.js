describe('the mocked entityManagerFactory', function() {
    'use strict';

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

    it('can be cloned', inject(function(entityManagerFactory) {
        var clonedMgr = entityManagerFactory.newManager();
        expect(mgr.metadataStore === clonedMgr.metadataStore);
    }));

    it('can be cloned with different serviceName by hacking its _id property', inject(function (entityManagerFactory) {
        var ds = new breeze.DataService({
            hasServerMetadata: false,
            serviceName: '/somethingElse/'
        });
        var clonedMgr = entityManagerFactory.newManager(ds);
        expect(clonedMgr.serviceName).toMatch('somethingElse');
        expect(mgr.serviceName !== clonedMgr.serviceName);

        //BAD BAD BAD
        clonedMgr.metadataStore._id = mgr.metadataStore._id;


        expect(mgr.metadataStore === clonedMgr.metadataStore);
    }));

    it('can be cloned by calling Breeze method entityManager.createEmptyCopy', function () {
        var clonedMgr = mgr.createEmptyCopy();
        expect(mgr.metadataStore === clonedMgr.metadataStore);
    });

    it('can be cloned by calling Breeze method entityManager.createEmptyCopy and setting its own dataService', function () {
        var clonedMgr = mgr.createEmptyCopy();
        expect(mgr.metadataStore === clonedMgr.metadataStore);
        expect(clonedMgr.serviceName).toMatch('mocked');
        var ds = new breeze.DataService({
            serviceName: '/somethingElse/',
            hasServerMetadata: false
        });
        clonedMgr.setProperties({ dataService: ds });
        expect(clonedMgr.serviceName).toMatch('somethingElse');
        expect(mgr.metadataStore === clonedMgr.metadataStore);

        var batch = mgr.createEntity('Batch', {
            batchID: 100,
        });

        //Quickly test export import
        var entitiesToExport = [batch];
        var exportedEntities = mgr.exportEntities(entitiesToExport);
        clonedMgr.importEntities(exportedEntities);
    });
});