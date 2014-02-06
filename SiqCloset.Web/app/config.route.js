(function () {
    'use strict';

    var app = angular.module('app');

    // Collect the routes
    app.constant('routes', getRoutes());
    
    // Configure the routes and route resolvers
    app.config(['$routeProvider', 'routes', routeConfigurator]);
    function routeConfigurator($routeProvider, routes) {

        routes.forEach(function (r) {
            //$routeProvider.when(r.url, r.config);
            setRoute(r.url, r.config);
        });
        $routeProvider.otherwise({ redirectTo: '/' });

        function setRoute(url, definition) {
            definition.resolve = angular.extend(definition.resolve || {}, {
                prime: prime,
            });
            $routeProvider.when(url, definition);
            return $routeProvider;
        }

        prime.$inject = ['datacontext'];
        function prime(dc) {
            return dc.prime();
        }
    }

    // Define the routes 
    function getRoutes() {
        return [
            {
                url: '/',
                config: {
                    templateUrl: 'app/dashboard/dashboard.html',
                    title: 'dashboard',
                    settings: {
                        nav: 1,
                        content: '<i class="icon-dashboard"></i> Dashboard'
                    }
                }
            }, {
                url: '/masterCustomerAddress',
                config: {
                    title: 'masterCustomerAddress',
                    templateUrl: 'app/upload/masterCustomerAddress/masterCustomerAddress.html',
                    settings: {
                        nav: 2,
                        content: '<i class="icon-lock"></i> Upload MCA'
                    }
                }
            }, {
                url: '/customerItemList',
                config: {
                    title: 'customerItemList',
                    templateUrl: 'app/upload/customerItemList/customerItemList.html',
                    settings: {
                        nav: 3,
                        content: '<i class="icon-lock"></i> Upload CIL'
                    }
                }
            }, {
                url: '/customer',
                config: {
                    title: 'customer',
                    templateUrl: 'app/customer/customers.html',
                    settings: {
                        nav: 4,
                        content: '<i class="icon-user"></i> Customer'
                    }
                }
            }, {
                url: '/shippingAddress',
                config: {
                    title: 'Shipping Address',
                    templateUrl: 'app/forms/shippingAddress.html',
                    settings: {
                        nav: 5,
                        content: '<i class="icon-home"></i> Shipping Address'
                    }
                }
            }, {
                url: '/batch',
                config: {
                    title: 'Customer Item List',
                    templateUrl: 'app/batch/batches.html',
                    settings: {
                        nav: 6,
                        content: '<i class="icon-briefcase"></i> Customer Item List'
                    }
                }
            }, {
                url: '/batch/:id',
                config: {
                    title: 'batch',
                    templateUrl: 'app/batch/batchDetails.html',
                    settings: { }
                }
            }, {
                url: '/customer/:id',
                config: {
                    title: 'customer',
                    templateUrl: 'app/customer/customerDetails.html',
                    settings: { }
                }
            }, {
                url: '/workInProgress',
                config: {
                    title: 'workInProgress',
                    templateUrl: 'app/wip/wip.html',
                    settings: {
                        content: '<i class="icon-asterisk"></i> Work in Progress'
                    }
                }
            }
        
        ];
    }
})();