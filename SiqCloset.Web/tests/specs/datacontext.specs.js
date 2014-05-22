describe('the datacontext', function () {
    'use strict';

    var datacontext;
    var $rootScope;
    var $scope;

    beforeEach(function() {
        testFns.prepareAppModuleForTest();

        inject(function(_$rootScope_, _datacontext_) {
            $rootScope = _$rootScope_;
            $scope = $rootScope.$new();
            datacontext = _datacontext_;
        });

    });

    it('should pass', function() {
        expect(true).toBe(true);
    });

    it('should get initialized with mocked entityManager', function() {
        pending();
    });

    it('should have customers in cache', function() {
        var customers = datacontext.customer.getAllLocal();
        expect(customers.length).toBeGreaterThan(0);
    });

    it('should be able to query customers', function (done) {
        
        datacontext.customer.getAll().then(function (results) {
            var customers = results;
            expect(customers.length).toBeGreaterThan(0);
            done();
        });

        $rootScope.$digest();

    });

    it('should broadcast entitiesChangedEvent', inject(function (common, config) {
        spyOn(common, '$broadcast').and.callThrough();
        var entitiesChangedEventCalled = false;
        $scope.$on(config.events.entitiesChanged, function (event, data) {
            entitiesChangedEventCalled = true;
        });

        var aCustomer = datacontext.customer.getAllLocal()[0];
        aCustomer.name = 'something';
        expect(common.$broadcast).toHaveBeenCalled();
        expect(entitiesChangedEventCalled).toBe(true);
        
    }));
});