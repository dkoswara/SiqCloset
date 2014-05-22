describe('the dashboard', function () {
    'use strict';

	var vm, $timeout, $rootScope;
	var commonMock;
	var datacontextMock;
	var currencyExchangeMock;

	beforeEach(function () {

	    // load the module you're testing.
	    module('app');

        //by loading the module app above and injecting services below
	    //$routeProvider will be called which does a bunch of $http calls
	    //I'm using $httpBackend to mock the GET responses here
        //TODO: Figure out how to mock the $routeProvider so it doesn't do anything
		testFns.mockHttpReq();

	    // we can also spy on the prime method to avoid the datacontext.prime call
		//inject(function (datacontext) {
		//    spyOn(datacontext, 'prime');
		//});

		// INJECT! This part is critical
		// _$rootScope_ - injected to create a new $scope instance.
		// $controller - injected to create an instance of our controller.
		// $q - injected so we can create promises for our mocks.
		// _$timeout_ - injected to we can flush unresolved promises.
		inject(function (_$rootScope_, $controller, $q, _$timeout_) {

		    // assign $timeout to a scoped variable so we can use
			// $timeout.flush() later. Notice the _underscore_ trick
			// so we can keep our names clean in the tests.
		    $timeout = _$timeout_;

		    // assign $rootScope so we can use $rootScope.$digest
            // this also resolves all the promises
		    $rootScope = _$rootScope_;

		    (function setupCommonMock() {
		        commonMock = jasmine.createSpyObj('common', ['activateController']);
		        commonMock.activateController.and.callFake(function () {
		            return $q.when(true);
		        });
		        commonMock.logger = {
		            getLogFn: function () {
		                var logFn = function (val) { };
		                return logFn;
		            }
		        };
		    })();

            (function setupCustomerRepoMock() {
                var customerRepoMock = jasmine.createSpyObj('customer', ['getCount', 'getTopTenCustomers']);
                customerRepoMock.getCount.and.callFake(function () { return $q.when(10); });
                customerRepoMock.getTopTenCustomers.and.callFake(function () {
                    var customersMap = [];

                    [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].forEach(function (num) {
                        customersMap.push({ name: 'customer ' + num, itemsCount: num * 10 });
                    });

                    return $q.when(customersMap);
                });

                datacontextMock = {
                    customer: customerRepoMock,
                };
            })();

		    (function setupCurrencyExchangeMock() {
		        currencyExchangeMock = jasmine.createSpyObj('currencyExchange', ['getData']);
		        currencyExchangeMock.getData.and.callFake(function () {
		            return $q.when({ data: { rate: 10000 } });
		        });
		    })();

			// now run that scope through the controller function,
			// injecting any services or other injectables we need.
			// **NOTE**: this is the only time the controller function
			// will be run, so anything that occurs inside of that
			// will already be done before the first spec.
			vm = $controller('dashboard', {
				$timeout: $timeout,
				common: commonMock,
				datacontext: datacontextMock,
				currencyExchange: currencyExchangeMock,
			});

		});
	});

    //HotTowel app flow

    //1. call common.activateController with promises returned by various services

    //2. the various services do their job

	//3. promises gets resolved, controller is activated

	//4. vm bindings should have data

	it('should have called common.activateController', function() {
	    expect(commonMock.activateController).toHaveBeenCalled();
	});

	it('should have called datacontext.customer.getCount', function () {
	    expect(datacontextMock.customer.getCount).toHaveBeenCalled();
	});

	it('should have called datacontext.customer.getTopTenCustomers', function () {
	    expect(datacontextMock.customer.getTopTenCustomers).toHaveBeenCalled();
	});

	it('should have called currencyExchange.getData', function () {
	    expect(currencyExchangeMock.getData).toHaveBeenCalled();
	});

	it('should have introduction text', function() {
	    expect(vm.intro.title).toBeTruthy();
	});
	
	it('should have current date and time', function() {
	    var currDateTime = moment().format('MMMM Do YYYY, h:mm:ss a');
	    expect(vm.currentDateTime).toEqual(currDateTime);
	});

	it('should have customers count', function() {
	    $rootScope.$digest();   //can also call $timeout.flush to resolve promises
	    expect(vm.customersCount).toBe(10);
	});

    it('should have current currency exchange rate', function() {
        $rootScope.$digest();
        expect(vm.exchangeRateText).toContain('10000');
    });

	it('should have the top ten customers', function() {
	    $rootScope.$digest();
	    expect(vm.customerSummary.summaries.length).toBe(10);
	});

});