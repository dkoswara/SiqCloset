(function () {
    'use strict';

    var serviceId = 'currencyExchange';

    angular.module('app').factory(serviceId,
        ['$http', 'common', 'entityManagerFactory', 'config', currencyExchange]);

    function currencyExchange($http, common, emFactory, config) {
        var getLogFn = common.logger.getLogFn;
        var log = getLogFn(serviceId);
        var logError = getLogFn(serviceId, 'error');
        var logSuccess = getLogFn(serviceId, 'success');


        //TODO: try to figure out why using EntityManager doesn't work
        //probably has something to do with using Angular $http for UseJsonP

        //var manager = configureManager(config.rateExchangeRemoteServiceName);
        //var manager = new breeze.EntityManager();

        var service = {
            getData: getData
        };

        return service;

        function getData() {
            var url = config.rateExchangeRemoteServiceName + 'currency?callback=JSON_CALLBACK&from=USD&to=IDR';
            return $http({
                method: 'JSONP',
                url: url
            }).success(function (data) {
                logSuccess('Successfully retrieved currency exchange rate', data, true);
                return data;
            }).error(function (data, status) {
                logError('Failed to retrieve currency exchange rate', data, false);
            });
        }

        //function getData() {
        //    var ds = new breeze.DataService({
        //        serviceName: config.rateExchangeRemoteServiceName,
        //        hasServerMetadata: false,
        //        useJsonp: true,
        //    });

        //    //http://rate-exchange.appspot.com/currency?from=USD&to=IDR
        //    var query = breeze.EntityQuery
        //        .from('currency')
        //        .withParameters({
        //            from: 'USD',
        //            to: 'IDR',
        //        }).using(ds);

        //    return manager.executeQuery(query)
        //        .then(function(data) {
        //            logSuccess('Successfully retrieved currency exchange rate', data, true);
        //            return data;
        //        })
        //        .fail(function(error) {
        //            logError('Failed to retrieve currency exchange rate', error);
        //            throw error;
        //        });
        //}

        //function configureManager(serviceName) {
            
        //    var ds = new breeze.DataService({
        //        serviceName: serviceName,
        //        hasServerMetadata: false,
        //        useJsonp: true,
        //    });

        //    return emFactory.newManager(ds);
        //}

        
    }
})();