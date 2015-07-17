(function () {
    'use strict';

    var app = angular.module('app');

    // Collect the states
    app.constant('states', getStates());

    // Configure the states and state resolvers
    app.config(['$stateProvider', '$urlRouterProvider', 'states', stateConfigurator]);
    function stateConfigurator($stateProvider, $urlRouterProvider, states) {

        states.forEach(function (s) {
            setState(s.name, s.config);
        });
        
        $urlRouterProvider.otherwise('/');

        function setState(name, definition) {
            definition.resolve = angular.extend(definition.resolve || {}, {
                prime: prime,
            });
            $stateProvider.state(name, definition);
            return $stateProvider;
        }

        prime.$inject = ['datacontext'];
        function prime(dc) {
            return dc.prime();
        }
    }

    // Define the states 
    function getStates() {
        return [
            {
                name: 'dashboard',
                config: {
                    url: '/',
                    templateUrl: 'app/dashboard/dashboard.html',
                    title: 'Dashboard',
                    settings: {
                        nav: 1,
                        content: '<i class="icon-dashboard"></i> Dashboard'
                    }
                }
            }, {
                name: 'customer',
                config: {
                    url: '/customer',
                    title: 'Master Customer Address',
                    templateUrl: 'app/customer/customers.html',
                    settings: {
                        nav: 2,
                        content: '<i class="icon-user"></i> Master Customer Address'
                    }
                }
            }, {
                name: 'batch',
                config: {
                    url: '/batch',
                    title: 'Customer Item List',
                    templateUrl: 'app/batch/batches.html',
                    settings: {
                        nav: 3,
                        content: '<i class="icon-briefcase"></i> Customer Item List'
                    }
                }
            }, {
                name: 'masterCustomerAddress',
                config: {
                    url: '/masterCustomerAddress',
                    title: 'Upload MCA',
                    templateUrl: 'app/upload/masterCustomerAddress/masterCustomerAddress.html',
                    settings: {
                        nav: 4,
                        content: '<i class="icon-lock"></i> Upload MCA'
                    }
                }
            }, {
                name: 'customerItemList',
                config: {
                    url: '/customerItemList',
                    title: 'Upload CIL',
                    templateUrl: 'app/upload/customerItemList/customerItemList.html',
                    settings: {
                        nav: 5,
                        content: '<i class="icon-lock"></i> Upload CIL'
                    }
                }
            }, {
                name: 'shippingAddress',
                config: {
                    url: '/shippingAddress',
                    title: 'Shipping Address',
                    templateUrl: 'app/forms/shippingAddress.html',
                    settings: {
                        nav: 6,
                        content: '<i class="icon-home"></i> Shipping Address'
                    }
                }
            }, {
                name: 'batchDetail',
                config: {
                    url: '/batch/:id',
                    title: 'Batch Detail',
                    templateUrl: 'app/batch/batchDetails.html',
                    settings: {}
                }
            }, {
                name: 'customerDetail',
                config: {
                    url: '/customer/:id',
                    title: 'Customer Detail',
                    templateUrl: 'app/customer/customerDetails.html',
                    settings: {}
                }
            }, {
                name: 'wip',
                config: {
                    url: '/workInProgress',
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