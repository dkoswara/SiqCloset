describe("Breeze tests", function() {

    it('should query using Breeze', function(done) {

        var mgr = new breeze.EntityManager({
            serviceName: 'breeze/Breeze',
        });
        var query = breeze.EntityQuery.from('Batches');


        mgr.executeQuery(query)
            .then(function (data) {
                expect(data.results.length > 0).toBe(true);
                done();
            })
            .fail(function (error) {
                console.log(error);
                expect(true).toBe(false);
                done();
            });
    });

    it('should query Google currency exchange using Breeze', function (done) {

        var serviceName = 'http://rate-exchange.appspot.com/';

        var ds = new breeze.DataService({
            serviceName: serviceName,
            hasServerMetadata: false,
            useJsonp: true,
        });

        var mgr = new breeze.EntityManager({ dataService: ds });

        //http://rate-exchange.appspot.com/currency?from=USD&to=EUR
        var query = breeze.EntityQuery
            .from('currency')
            .withParameters({
                from: 'USD',
                to: 'EUR',
            });

        mgr.executeQuery(query)
            .then(function (data) {
                expect(data.results.length == 1).toBe(true);
                done();
            })
            .fail(function (error) {
                console.log(error);
                expect(true).toBe(false);
                done();
            });
    });

});