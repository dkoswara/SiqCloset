//jasmine.DEFAULT_TIMEOUT_INTERVAL = 60 * 1000;

describe("Breeze tests", function () {

    var siqClosetRemoteServiceName = 'http://localhost:3958/breeze/Breeze';

    it('should query using Breeze', function(done) {

        var mgr = new breeze.EntityManager({
            serviceName: siqClosetRemoteServiceName,
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

    it('should query Batches and SelectMany Customers', function (done) {
        //breeze.NamingConvention.camelCase.setAsDefault();

        var mgr = new breeze.EntityManager({
            serviceName: siqClosetRemoteServiceName,
        });
        var query = breeze.EntityQuery.from('Items')
            .where('BatchID', '==', 130)
            .expand('Customer');

        mgr.executeQuery(query)
            .then(function (data) {
                var underscore = _;
                var custs = underscore.pluck(data.results, 'Customer');
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

        var mgr = getConfiguredManager(serviceName);

        //http://rate-exchange.appspot.com/currency?from=USD&to=IDR
        var query = breeze.EntityQuery
            .from('currency')
            .withParameters({
                from: 'USD',
                to: 'IDR',
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

        function getConfiguredManager(remoteServiceName) {
            var ds = new breeze.DataService({
                serviceName: remoteServiceName,
                hasServerMetadata: false,
                useJsonp: true,
            });

            return new breeze.EntityManager({ dataService: ds });
        }
    });

    it('should query Google currency exchange using Breeze by specifying a DataService to EntityQuery.using', function (done) {
        var serviceName = 'http://rate-exchange.appspot.com/';

        var ds = new breeze.DataService({
            serviceName: serviceName,
            hasServerMetadata: false,
            useJsonp: true,
        });

        var mgr = new breeze.EntityManager();

        //http://rate-exchange.appspot.com/currency?from=USD&to=IDR
        var query = breeze.EntityQuery
            .from('currency')
            .withParameters({
                from: 'USD',
                to: 'IDR',
            }).using(ds);

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

    it('should query and cache Google currency exchange using Breeze via client metadata', function (done) {
        breeze.NamingConvention.defaultInstance.setAsDefault();

        var serviceName = 'http://rate-exchange.appspot.com/';

        var jsonResultsAdapter = new breeze.JsonResultsAdapter({
            name: "currencyExchange",
            visitNode: function (node, mappingContext, nodeContext) {
                //node.id = 1;
                return { entityType: 'Currency' };
            }
        });

        var ds = new breeze.DataService({
            serviceName: serviceName,
            hasServerMetadata: false,
            useJsonp: true,
            jsonResultsAdapter: jsonResultsAdapter,
        });

        var mgr = new breeze.EntityManager({ dataService: ds });
        initialize(mgr.metadataStore);

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
                var currencyEntity = data.results[0];
                expect(currencyEntity.from == 'USD').toBe(true);
                expect(currencyEntity.to == 'EUR').toBe(true);
                expect(currencyEntity.entityAspect.entityState.isUnchanged()).toBe(true);

                var fromCache = mgr.getEntityByKey(currencyEntity.entityAspect.getKey());
                expect(currencyEntity.to == fromCache.to).toBe(true);

                done();
            })
            .fail(function (error) {
                console.log(error);
                expect(true).toBe(false);
                done();
            });


        function initialize(metadataStore) {
            var DT = breeze.DataType;
            metadataStore.addEntityType({
                shortName: "Currency",
                namespace: "currencyExchange",
                dataProperties: {
                    //id: { dataType: DT.Int32, isPartOfKey: true },
                    to: { dataType: DT.String, isPartOfKey: true },
                    rate: { dataType: DT.Double },
                    from: { dataType: DT.String }
                },
            });
        }
    });

    //it('should query Northwind OData sample service using Breeze', function(done) {
    //    //OData.defaultHttpClient.enableJsonpCallback = true;
    //    //OData.defaultHttpClient.callbackParameterName = undefined;
    //    //OData.defaultHttpClient.formatQueryString = undefined;

    //    //breeze.config.initializeAdapterInstances({
    //    //    dataService: "OData",
    //    //});

    //    //var dataServiceAdapter = breeze.config.getAdapterInstance('dataService');


    //    var serviceName = 'http://services.odata.org/V4/Northwind/Northwind.svc/';

    //    var ds = new breeze.DataService({
    //        serviceName: serviceName,
    //        hasServerMetadata: false,
    //        useJsonp: true,
    //    });

    //    var mgr = new breeze.EntityManager({ dataService: ds });
    //    //var mgr = new breeze.EntityManager(serviceName);

    //    //mgr.fetchMetadata().then(function() {
    //    //    queryCustomers();
    //    //}).fail(function(error) {
    //    //    console.log(error);
    //    //    done();
    //    //});

    //    //queryCustomers();
    //    queryCustomersWithDatajs();
    //    //queryCustomersWithJQuery();

    //    function queryCustomers() {
    //        //http://services.odata.org/V4/Northwind/Northwind.svc/Customers
    //        var query = breeze.EntityQuery
    //            .from('Customers');

    //        mgr.executeQuery(query)
    //            .then(function(data) {
    //                expect(data.results.length > 0).toBe(true);
    //                done();
    //            })
    //            .fail(function(error) {
    //                console.log(error);
    //                expect(true).toBe(false);
    //                done();
    //            });
    //    }

    //    function queryCustomersWithDatajs() {
    //        //OData.defaultHttpClient.enableJsonpCallback = true;
    //        //OData.defaultHttpClient.callbackParameterName = '';
    //        //OData.defaultHttpClient.formatQueryString = '';
    //        var oHeaders = {};
    //        oHeaders['Content-Type'] = 'text/plain';
    //        OData.read({
    //                requestUri: "http://services.odata.org/Northwind/Northwind.svc/Customers",
    //                headers: oHeaders,
    //                enableJsonpCallback: true,
    //                method: 'GET',
    //            },
    //            function(data, response) {
    //                alert("Operation succeeded.");
    //            }, function(err) {
    //                alert("Error occurred " + err.message);
    //            });
    //    }

    //    function queryCustomersWithJQuery() {
    //        $.ajax({
    //            url: 'http://services.odata.org/Northwind/Northwind.svc/Customers',
    //            dataType: 'jsonp',
    //        })
    //        .done(function (data) {
    //            expect(data).toBeTruthy();
    //            console.log(data);
    //            done();
    //        }).fail(function (jqXHR, textStatus, errorThrown) {
    //            console.log(jqXHR.responseText);
    //            expect(true).toBe(false);
    //            done();
    //        });
    //    }
    //});

});