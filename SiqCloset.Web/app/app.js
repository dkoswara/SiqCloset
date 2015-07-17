(function () {
    'use strict';
    
    var app = angular.module('app', [
        // Angular modules 
        'ngAnimate',        // animations
        //'ngRoute',          // routing with ngRoute
        'ngSanitize',       // sanitizes html bindings (ex: sidebar.js)
        'ngGrid',           // Angular.UI data grid

        // Custom modules 
        'common',           // common functions, logger, spinner
        'common.bootstrap', // bootstrap dialog wrapper functions

        // 3rd Party Modules
        'ui.bootstrap',      // ui-bootstrap (ex: carousel, pagination, dialog)
        'ui.router',          // routing with UI-Router
        'angularFileUpload', //angular file upload
        'breeze.angular',
        'breeze.directives', //Breeze/AngularJS directives
        'ngzWip',            // angular-breeze local storage feature
    ]);
    
    app.run(['$state', '$stateParams', 'routeMediator', 'breeze', function ($state, $stateParams, routeMediator, breeze) {
        //other services not being used here are included to kick start their respected module

        // Handle routing errors and success events
        routeMediator.setRoutingHandlers();
    }]);
})();