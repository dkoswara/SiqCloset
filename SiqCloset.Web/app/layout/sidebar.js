(function () { 
    'use strict';
    
    var controllerId = 'sidebar';
    angular.module('app').controller(controllerId,
        ['$route', 'config', 'routes', 'zStorage', 'bootstrap.dialog', 'datacontext', sidebar]);

    function sidebar($route, config, routes, zStorage, bsDialog, datacontext) {
        var vm = this;

        vm.isCurrent = isCurrent;
        vm.clearStorage = clearStorage;
        vm.wip = [];
        vm.routes = routes;
        vm.wipChangedEvent = config.events.storage.wipChanged;

        activate();

        function activate() {
            getNavRoutes();
            vm.wip = datacontext.zStorageWip.getWipSummary();
        }
        
        function getNavRoutes() {
            vm.navRoutes = routes.filter(function(r) {
                return r.config.settings && r.config.settings.nav;
            }).sort(function(r1, r2) {
                return r1.config.settings.nav > r2.config.settings.nav;
            });
        }
        
        function isCurrent(route) {
            if (!route.config.title || !$route.current || !$route.current.title) {
                return '';
            }
            var menuName = route.config.title;
            //return $route.current.title.substr(0, menuName.length) === menuName ? 'current' : '';
            return $route.current.title === menuName ? 'current' : '';
        }

        function clearStorage() {
            return bsDialog.deleteDialog('local storage').then(confirm, cancel);

            function confirm() { zStorage.clear(); }

            function cancel() { }

        }
    };
})();