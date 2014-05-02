jasmine.DEFAULT_TIMEOUT_INTERVAL = 60 * 1000;

describe('true', function(){

	it('should be true', function(){
		expect(true).toBeTruthy();
	});

	it('should be false', function(){
		expect(false).toBeFalsy();
	});

	it('should be true again', function (done) {
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

    it('should call jQuery $.ajaxss', function(jasmineDone) {
        $.ajax({
            url: 'http://localhost:3958/breeze/Breeze/Batches',
            //dataType: 'jsonp',
            })
            .done(function (data) {
                console.log('successs');
                expect(data).toBeTruthy();
                jasmineDone();
            }).fail(function (jqXHR, textStatus, errorThrown) {
                console.log('failed again!!');
                console.log(jqXHR);
                console.log(textStatus);
                console.log(errorThrown);
                expect(true).toBe(false);
                jasmineDone();
        });
    });
});