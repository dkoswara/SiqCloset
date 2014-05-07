ddescribe('The Dashboard', function () {

	var $scope, ctrl, $timeout;

	/* declare our mocks out here
	 * so we can use them through the scope 
	 * of this describe block.
	 */
	var commonMock;
	var datacontextMock;
	var currencyExchangeMock;

	// This function will be called before every "it" block.
	// This should be used to "reset" state for your tests.
	beforeEach(function () {
		// Create a "spy object" for each of the custom service used by dashboard.
		// This will isolate the controller we're testing from
		// any other code.
	    // we'll set up the returns for this later 

	    //commonMock = jasmine.createSpyObj('common', ['activateController']);	    
	    //datacontextMock = jasmine.createSpy('datacontext');
		//currencyExchangeMock = jasmine.createSpy('currencyExchange');

		// load the module you're testing.
		module('app');

		// INJECT! This part is critical
		// $rootScope - injected to create a new $scope instance.
		// $controller - injected to create an instance of our controller.
		// $q - injected so we can create promises for our mocks.
		// _$timeout_ - injected to we can flush unresolved promises.
		inject(function ($rootScope, $controller, $q, _$timeout_) {
			// create a scope object for us to use.
			$scope = $rootScope.$new();

			// set up the returns for our 'common' service mock
			//commonMock.activateController.and.returnValue(true);

			// assign $timeout to a scoped variable so we can use 
			// $timeout.flush() later. Notice the _underscore_ trick
			// so we can keep our names clean in the tests.
			$timeout = _$timeout_;

			commonMock = {
			    logger: {
			        getLogFn: function () { 
			        	var logFn = function(val) {};
			        	return logFn;
			        }
			    },
			    activateController: function () { return $q.when('done'); }
			};
			spyOn(commonMock, 'activateController').and.returnValue($q.when('done'));

		    datacontextMock = {
		        customer: {
		            getCount: function() { return $q.when(1); },
		            getTopTenCustomers: function() { return $q.when({}); },
		        },
		        prime: function() { return $q.when({}); },
		    };

		    spyOn(datacontextMock, 'prime').and.returnValue($q.when({}));

		    currencyExchangeMock = {
		        getData: function() { return $q.when({
		        		data: { rate: 10000 }		        		
		        	});
		    	},
		    };

			// now run that scope through the controller function,
			// injecting any services or other injectables we need.
			// **NOTE**: this is the only time the controller function
			// will be run, so anything that occurs inside of that
			// will already be done before the first spec.
			ctrl = $controller('dashboard', {
				$timeout: $timeout,
				common: commonMock,
				datacontext: datacontextMock,
				currencyExchange: currencyExchangeMock,
			});

		});
	});

	it('should have called common.activateController', function() {
	    expect(commonMock.activateController).toHaveBeenCalled();
	});

	it('should have introduction text', function() {
	    expect(ctrl.intro.title).toBeTruthy();
	});
	
	it('should have current date and time', function () { });

	it('should have customers count', function () { });

    iit('should have current currency exchange rate', function() {
    	$timeout.flush();
        expect(ctrl.exchangeRateText).toBeTruthy();
    });

	it('should have the top ten customers', function () { });

});