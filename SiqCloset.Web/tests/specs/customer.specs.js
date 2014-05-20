describe('the customer controller', function () {
    'use strict';

    var vm;
    var $injector;
    var $rootScope;
    var $timeout;
    var $location;

    beforeEach(function () {
        testFns.prepareAppModuleForTest();

        inject(function (_$injector_, $controller, _$rootScope_, _$location_, _$timeout_, _common_, _config_, _datacontext_) {
            $injector = _$injector_;
            $rootScope = _$rootScope_;
            $timeout = _$timeout_;
            $location = _$location_;
            vm = $controller('customers', {
                $location: _$location_,
                common: _common_,
                config: _config_,
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

    it('should be able to search', function () {
        $rootScope.$digest();
        var originalCount = vm.filteredCustomerPartials.length;

        //search for 'naomi'
        vm.searchText = 'naomi';
        vm.search({ keyCode: '' });
        //expect less array length from filtered results
        var newCount = vm.filteredCustomerPartials.length;
        expect(newCount).toBeLessThan(originalCount);
        console.log(newCount + ' < ' + originalCount);

        //simulate esc key being pressed
        vm.search({ keyCode: 27 });
        //expect same array length as original as results are no longer filtered
        newCount = vm.filteredCustomerPartials.length;
        expect(newCount).toEqual(originalCount);
        console.log(newCount + ' == ' + originalCount);
    });


});