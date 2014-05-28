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
                    title: 'Dashboard',
                    settings: {
                        nav: 1,
                        content: '<i class="icon-dashboard"></i> Dashboard'
                    }
                }
            }, {
                url: '/customer',
                config: {
                    title: 'Master Customer Address',
                    templateUrl: 'app/customer/customers.html',
                    settings: {
                        nav: 2,
                        content: '<i class="icon-user"></i> Master Customer Address'
                    }
                }
            }, {
                url: '/batch',
                config: {
                    title: 'Customer Item List',
                    templateUrl: 'app/batch/batches.html',
                    settings: {
                        nav: 3,
                        content: '<i class="icon-briefcase"></i> Customer Item List'
                    }
                }
            }, {
                url: '/masterCustomerAddress',
                config: {
                    title: 'Upload MCA',
                    templateUrl: 'app/upload/masterCustomerAddress/masterCustomerAddress.html',
                    settings: {
                        nav: 4,
                        content: '<i class="icon-lock"></i> Upload MCA'
                    }
                }
            }, {
                url: '/customerItemList',
                config: {
                    title: 'Upload CIL',
                    templateUrl: 'app/upload/customerItemList/customerItemList.html',
                    settings: {
                        nav: 5,
                        content: '<i class="icon-lock"></i> Upload CIL'
                    }
                }
            }, {
                url: '/shippingAddress',
                config: {
                    title: 'Shipping Address',
                    templateUrl: 'app/forms/shippingAddress.html',
                    settings: {
                        nav: 6,
                        content: '<i class="icon-home"></i> Shipping Address'
                    }
                }
            }, {
                url: '/batch/:id',
                config: {
                    title: 'Batch Detail',
                    templateUrl: 'app/batch/batchDetails.html',
                    settings: { }
                }
            }, {
                url: '/customer/:id',
                config: {
                    title: 'Customer Detail',
                    templateUrl: 'app/customer/customerDetails.html',
                    settings: { }
                }
            }, {
                url: '/workInProgress',
                config: {
                    title: 'Work In Progress',
                    templateUrl: 'app/wip/wip.html',
                    settings: {
                        content: '<i class="icon-asterisk"></i> Work in Progress'
                    }
                }
            }
        
        ];
    }
})();