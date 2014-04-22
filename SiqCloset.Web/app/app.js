(function () {
    'use strict';
    
    var app = angular.module('app', [
        // Angular modules 
        'ngAnimate',        // animations
        'ngRoute',          // routing
        'ngSanitize',       // sanitizes html bindings (ex: sidebar.js)
        'ngGrid',           // Angular.UI data grid

        // Custom modules 
        'common',           // common functions, logger, spinner
        'common.bootstrap', // bootstrap dialog wrapper functions

        // 3rd Party Modules
        'ui.bootstrap',      // ui-bootstrap (ex: carousel, pagination, dialog)
        'angularFileUpload', //angular file upload
        'breeze.angular',
        'breeze.directives', //Breeze/AngularJS directives
        'ngzWip',            // angular-breeze local storage feature
    ]);
    
    // Handle routing errors and success events
    app.run(['$route', 'routeMediator', function ($route, routeMediator) {
        routeMediator.setRoutingHandlers();
        // Include $route to kick start the router.
    }]);
})();