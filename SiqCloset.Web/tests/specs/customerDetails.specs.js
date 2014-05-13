'use strict';

ddescribe('the customerDetails controller', function() {

    var ctrl;
    var $rootScope;
    var $timeout;
    var $loc;
    var testCustId = '809930f8-3c1e-4943-b5e9-9f6d258f730d';
    var zStorageWip;

    beforeEach(function () {
        //testFns.prepareAppModuleForTest();
        module('app');

        testFns.prepareMockedEntityManager();

        //module(function($provide) {
        //    $provide.decorator('$routeParams', function($delegate) {
        //        $delegate.id = '809930f8-3c1e-4943-b5e9-9f6d258f730d';
        //    });
        //});

        testFns.mockHttpReq();

        inject(function ($injector, $controller, _$rootScope_, _$location_, _$window_, _$timeout_, _common_, _config_, _datacontext_, _model_, _zStorageWip_) {
            $rootScope = _$rootScope_;
            $timeout = _$timeout_;
            $loc = _$location_;
            zStorageWip = _zStorageWip_;
            ctrl = $controller('customerDetails', {
                $location: _$location_,
                $routeParams: {
                    id: testCustId,
                },
                $window: _$window_,
                $scope: $rootScope.$new(),

                //amazingly this works. have to use quotes since name has 'dot'
                'bootstrap.dialog': $injector.get('bootstrap.dialog'),

                common: _common_,
                config: _config_,
                datacontext: _datacontext_,
                model: _model_,
            });
        });
    });

    it('should have customer upon activate', function () {
        //pending();
        $rootScope.$digest();
        expect(ctrl.customer.customerID).toEqual(testCustId);
    });

    it('should save to wip when customer is modified', function () {
        //Force resolve all $q promises
        $rootScope.$digest();
        ctrl.customer.name = 'yhwh';

        //Flush $timeout queue to force the calling of storeWipEntity in the controller
        $timeout.flush();

        checkWip();
        
        //Clear Wip so we have fresh state after each test
        zStorageWip.clearAllWip();

        function checkWip() {
            var wipEntityKey = zStorageWip.findWipKeyByEntityId('Customer', ctrl.customer.customerID);
            expect(wipEntityKey).toBeTruthy();
            var importedEntity = zStorageWip.loadWipEntity(wipEntityKey);
            expect(importedEntity).toBeDefined();
            expect(importedEntity.name).toEqual('yhwh');
        }
        
    });

    iit('should remove wip entity and call datacontext.cancel when cancelling customer edit', function() {
        //Force resolve all $q promises
        $rootScope.$digest();
        var origName = ctrl.customer.name;
        ctrl.customer.name = 'yhwh';

        //Flush $timeout queue to force the calling of storeWipEntity in the controller
        $timeout.flush();

        ctrl.cancel();

        checkWip();

        expect(ctrl.customer.name).toEqual(origName);

        function checkWip() {
            var wipEntityKey = zStorageWip.findWipKeyByEntityId('Customer', ctrl.customer.customerID);
            expect(wipEntityKey).toBe(null);
        }
    });

    it('should have bootstrap.dialog injected', function () {
        pending();
        ctrl.deleteCustomer();
    });
});