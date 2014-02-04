(function () {
    'use strict';

    var controllerId = 'customerItemList';

    angular.module('app').controller(controllerId,
        ['common', customerItemList]);

    function customerItemList(common) {
        var vm = this;
        var getLogFn = common.logger.getLogFn;
        var log = getLogFn(controllerId);

        vm.title = 'Customer Item List';

        activate();

        function activate() {
            common.activateController([], controllerId)
               .then(function () {
                   log('Activated Customer Item List View');
               });
        }

        
    }
})();
