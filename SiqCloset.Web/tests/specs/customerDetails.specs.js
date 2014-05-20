describe('the customerDetails controller', function () {
    'use strict';

    var vm;
    var $injector;
    var $rootScope;
    var $timeout;
    var $loc;
    var testCustId = '809930f8-3c1e-4943-b5e9-9f6d258f730d';
    var zStorageWip;
    var bsDialog;

    beforeEach(function () {
        testFns.prepareAppModuleForTest();

        inject(function (_$injector_, $controller, _$rootScope_, _$location_, _$window_, _$timeout_, _common_, _config_, _datacontext_, _model_, _zStorageWip_) {
            $injector = _$injector_;
            $rootScope = _$rootScope_;
            $timeout = _$timeout_;
            $loc = _$location_;
            zStorageWip = _zStorageWip_;
            bsDialog = $injector.get('bootstrap.dialog');
            vm = $controller('customerDetails', {
                $location: _$location_,
                $routeParams: {
                    id: testCustId,
                },
                $window: _$window_,
                $scope: $rootScope.$new(),

                //amazingly this works. have to use quotes since name has 'dot'
                'bootstrap.dialog': bsDialog,

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
        expect(vm.customer.customerID).toEqual(testCustId);
    });

    it('should save to wip when customer is modified', function () {
        //Force resolve all $q promises
        $rootScope.$digest();
        vm.customer.name = 'yhwh';

        //Flush $timeout queue to force the calling of storeWipEntity in the controller
        $timeout.flush();

        checkWip();
        
        //Clear Wip so we have fresh state after each test
        zStorageWip.clearAllWip();

        function checkWip() {
            var wipEntityKey = zStorageWip.findWipKeyByEntityId('Customer', vm.customer.customerID);
            expect(wipEntityKey).toBeTruthy();
            var importedEntity = zStorageWip.loadWipEntity(wipEntityKey);
            expect(importedEntity).toBeDefined();
            expect(importedEntity.name).toEqual('yhwh');
        }
        
    });

    it('should remove wip entity and call datacontext.cancel when cancelling customer edit', function() {
        //Force resolve all $q promises
        $rootScope.$digest();
        var origName = vm.customer.name;
        vm.customer.name = 'yhwh';

        //Flush $timeout queue to force the calling of storeWipEntity in the controller
        $timeout.flush();

        vm.cancel();

        checkWip();

        expect(vm.customer.name).toEqual(origName);

        function checkWip() {
            var wipEntityKey = zStorageWip.findWipKeyByEntityId('Customer', vm.customer.customerID);
            expect(wipEntityKey).toBe(null);
        }
    });

    it('should have bootstrap.dialog injected and called', function () {
        var $q = $injector.get('$q');
        vm.customer = {};
        vm.customer.name = 'someName';
        spyOn(bsDialog, 'deleteDialog').and.callFake(function() {
            var deferred = $q.defer();
            return deferred.promise;
        });
        vm.deleteCustomer();
        expect(bsDialog.deleteDialog).toHaveBeenCalled();
    });
});