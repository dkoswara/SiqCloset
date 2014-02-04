(function () {
    'use strict';

    // Factory name is handy for logging
    var serviceId = 'routeMediator';

    // Define the factory on the module.
    // Inject the dependencies. 
    // Point to the factory definition function.
    // TODO: replace app with your module name
    angular.module('app').factory(serviceId, ['$location', '$rootScope', 'config', 'common', routeMediator]);

    function routeMediator($location, $rootScope, config, common) {
        // Define the functions and properties to reveal.
        var handleRouteChangeError = false;
        var logger = common.logger;
        var service = {
            setRoutingHandlers: setRoutingHandlers,
        };

        return service;

        function setRoutingHandlers() {
            updateDocTitle();
            handleRoutingErrors();
        }

        function handleRoutingErrors() {
            $rootScope.$on('$routeChangeError', function (event, current, previous, rejection) {
                if (handleRouteChangeError) return;
                handleRouteChangeError = true;
                var msg = 'Error routing: ' + (current && current.name) + '. ' + (rejection.msg || ' ');
                logger.logWarning(msg, current, serviceId, true);
                $location.path('/');
            });
        }

        function updateDocTitle() {
            $rootScope.$on('$routeChangeSuccess', function (event, current, previous) {
                handleRouteChangeError = false;
                var title = config.docTitle + ' ' + (current.title || ' ');
                $rootScope.title = title;
            });

        }

    }
})();