//jasmine.DEFAULT_TIMEOUT_INTERVAL = 5 * 1000;

describe("a test for JasmineTest", function () {

    var angularHttp;

    beforeEach(inject(function ($http) {
        angularHttp = $http;
    }));
    
    it('should be true', function (done) {
        someAsyncPromise().then(function(result) {
            expect(result === 3).toBe(true);
            done();
        });

        function someAsyncPromise() {
            var defer = Q.defer();

            setTimeout(function () {
                defer.resolve(3);
            }, 500);

            return defer.promise;
        }
    });

    it('should call jQuery $.ajax', function(jasmineDone) {
        $.ajax('http://localhost:3958/breeze/Breeze/Batches')
            .done(function(data) {
                expect(data).toBeTruthy();
                jasmineDone();
            }).fail(function(jqXHR, textStatus, errorThrown) {
                console.log(jqXHR.responseText);
                expect(true).toBe(false);
                jasmineDone();
        });
    });

    it('should call AngularJS $http', function (jasmineDone) {
        angularHttp.get('http://localhost:3958/breeze/Breeze/Batches')
            .success(function (data) {
                expect(data).toBeTruthy();
                jasmineDone();
            }).error(function (error) {
                console.log(error);
                expect(true).toBe(false);
                jasmineDone();
            });
    });

    it('should call Google currency exchange', function (jasmineDone) {
        $.ajax({
            url: 'http://rate-exchange.appspot.com/currency?from=USD&to=SGD',
            dataType: 'jsonp',
            })
            .done(function (data) {
                expect(data).toBeTruthy();
                console.log(data);
                jasmineDone();
            }).fail(function (jqXHR, textStatus, errorThrown) {
                console.log(jqXHR.responseText);
                expect(true).toBe(false);
                jasmineDone();
            });
    });
});

//var $controllerConstructor;
//var scope;

//beforeEach(module('app'));

//beforeEach(inject(function ($controller, $rootScope) {
//    $controllerConstructor = $controller;
//    scope = $rootScope.$new();
//}));

//beforeEach(function () {
//    player = new Player();
//    song = new Song();
//});

//it('should have customers', function (done) {
//    var ctrl = $controllerConstructor('customers',
//    { $scope: scope });

    
//    ctrl.getCustomerPartials()
//        .then(function (results) {
//            expect(results.length).toBeGreaterThan(0);
//            done();
//        });
//});
