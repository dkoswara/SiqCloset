'use strict';

ddescribe('the customer controller', function () {

    var vm;
    var $injector;
    var $rootScope;
    var $timeout;
    var $location;

    beforeEach(function () {
        testFns.prepareAppModuleForTest();

        inject(function (_$injector_, $controller, _$rootScope_, _$location_, _$timeout_, _common_, _datacontext_) {
            $injector = _$injector_;
            $rootScope = _$rootScope_;
            $timeout = _$timeout_;
            $location = _$location_;
            vm = $controller('customers', {
                $location: _$location_,
                common: _common_,
                datacontext: _datacontext_,
            });
        });
    });

    it('should load all customers', function() {
        $rootScope.$digest();
        expect(vm.customerPartials.length).toBeGreaterThan(0);
    });

    it('should go to customer detail page when a customer is clicked', function() {
        $rootScope.$digest();
        var cust = vm.customerPartials[0];
        vm.goToCustomer(cust);
        expect($location.path()).toMatch(cust.customerID);
        console.log($location.path());
    });

    it('should be able to search', function() {
        pending();
        expect(vm.search).toBeDefined();
    });


});