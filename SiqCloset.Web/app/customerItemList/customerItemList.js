(function () {
    'use strict';

    var controllerId = 'customerItemList';

    angular.module('app').controller(controllerId,
        ['$routeParams', 'common', customerItemList]);

    function customerItemList($routeParams, common) {
        var vm = this;
        var getLogFn = common.logger.getLogFn;
        var log = getLogFn(controllerId);

        vm.title = 'Customer Item List';
        vm.batch = undefined;

        activate();

        function activate() {
            vm.batchID = $routeParams.id;
            common.activateController([], controllerId)
               .then(function () {
                   log('Activated Customer Item List View');
               });
        }

        
    }
})();
