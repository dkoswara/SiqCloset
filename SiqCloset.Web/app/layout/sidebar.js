(function () { 
    'use strict';
    
    var controllerId = 'sidebar';
    angular.module('app').controller(controllerId,
        ['$state', 'config', 'states', 'zStorage', 'bootstrap.dialog', 'datacontext', sidebar]);

    function sidebar($state, config, states, zStorage, bsDialog, datacontext) {
        var vm = this;

        vm.isCurrent = isCurrent;
        vm.clearStorage = clearStorage;
        vm.wip = [];
        vm.states = states;
        vm.wipChangedEvent = config.events.storage.wipChanged;

        activate();

        function activate() {
            getNavStates();
            vm.wip = datacontext.zStorageWip.getWipSummary();
        }
        
        function getNavStates() {
            vm.navStates = states.filter(function(s) {
                return s.config.settings && s.config.settings.nav;
            }).sort(function(s1, s2) {
                return s1.config.settings.nav > s2.config.settings.nav;
            });
        }
        
        function isCurrent(state) {
            if (!state.config.title || !$state.current || !$state.current.title) {
                return '';
            }
            var menuName = state.config.title;
            //return $state.current.title.substr(0, menuName.length) === menuName ? 'current' : '';
            return $state.current.title === menuName ? 'current' : '';
        }

        function clearStorage() {
            return bsDialog.deleteDialog('local storage').then(confirm, cancel);

            function confirm() { zStorage.clear(); }

            function cancel() { }

        }
    };
})();