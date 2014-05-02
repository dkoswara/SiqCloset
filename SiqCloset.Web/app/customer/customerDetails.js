(function () {
    'use strict';

    var controllerId = 'customerDetails';

    angular.module('app').controller(controllerId,
        ['$location', '$routeParams', '$window', '$scope', 'bootstrap.dialog', 'common', 'config', 'datacontext', 'model', customerDetails]);

    function customerDetails($location, $routeParams, $window, $scope, bsDialog, common, config, datacontext, model) {
        // Using 'Controller As' syntax, so we assign this to the vm variable (for viewmodel).
        var vm = this;

        var logError = common.logger.getLogFn(controllerId, 'error');
        var $q = common.$q;
        var entityName = model.modelInfo.Customer.entityName;
        var wipEntityKey = undefined;

        // Bindable properties and functions are placed on vm.
        vm.activate = activate;
        vm.customer = undefined;
        vm.getSelectedTitle = getSelectedTitle;
        vm.cancel = cancel;
        vm.save = save;
        vm.deleteCustomer = deleteCustomer;
        vm.isSaving = false;
        vm.goBack = goBack;
        vm.hasChanges = false;

        vm.customersToSelect = [];
        vm.selectedCustomer = undefined;

        Object.defineProperty(vm, 'canSave', {
            get: canSave
        });

        Object.defineProperty(vm, 'canCancel', {
            get: canCancel
        });

        function canSave() { return vm.canCancel && !vm.customer.entityAspect.getValidationErrors().length > 0; }

        function canCancel() {
             return vm.hasChanges && !vm.isSaving;
        }

        activate();

        function activate() {
            initLookups();
            onDestroy();
            onHasChanges();
            common.activateController([getRequestedCustomer()], controllerId)
                .then(onEveryChange)
                .then(function () {
                    //one can navigate from WIP view to here
                    //which means hasChanges must be updated
                    vm.hasChanges = datacontext.hasChanges();
                });
        }

        function initLookups() {
            //ToDo: Apply createNullo lesson
            //var customerNullo = datacontext.customer.createNullo();
            datacontext.customer.getAll()
                .then(function(data) {
                    vm.customersToSelect = data;
                    //vm.customersToSelect.unshift(customerNullo);
                });
        }

        function onHasChanges() {
            $scope.$on(config.events.hasChangesChanged,
                function (event, data) {
                    vm.hasChanges = data.hasChanges;
                });
        }

        function cancel() {
            datacontext.cancel();
            removeWipEntity();
            if (vm.customer.entityAspect.entityState.isDetached()) {
                goToCustomers();
            }
        }

        function goToCustomers() { $location.path('/customer'); }

        function onDestroy() {
            $scope.$on('$destroy', function () {
                autoStoreWip(true);
                datacontext.cancel();
            });
        }

        function save() {
            if (!canSave()) { return $q.when(null); }

            vm.isSaving = true;
            return datacontext.save()
                .then(function(saveResult) {
                    vm.isSaving = false;
                    removeWipEntity();
                }, function(error) {
                    vm.isSaving = false;
                });
        }

        function deleteCustomer() {
            return bsDialog.deleteDialog('Customer: ' + vm.customer.name)
                .then(confirmDelete);

            function confirmDelete() {
                datacontext.markDeleted(vm.customer);
                vm.save().then(success, failed);

                function success() {
                    removeWipEntity();
                    goToCustomers();
                }

                function failed() { cancel(); }
            }
        }

        function removeWipEntity() {
            datacontext.zStorageWip.removeWipEntity(wipEntityKey);
        }

        function goBack() { $window.history.back(); }
        
        function getRequestedCustomer() {
            var val = $routeParams.id;
            if (val === 'new') {
                vm.customer = datacontext.customer.create();
                return vm.customer;
            }

            return datacontext.customer.getEntityByIdOrFromWip(val)
                //return datacontext.customer.getById(val)
                .then(function (data) {
                    wipEntityKey = data.key;
                    vm.customer = data.entity || data;
                }, function(error) {
                    logError('Unable to get customer ' + val);
                    goToCustomers();
                });
        }
        
        function getSelectedTitle() {
            return 'Edit ' + ((vm.selectedCustomer && vm.selectedCustomer.name) || '');
        }

        function storeWipEntity() {
            if (!vm.customer) return;
            var description = vm.customer.name || '[New Customer]' + vm.customer.customerID;

            //var routeState = 'customer';  //use routeState if entityType name is different than what's in the model. 
                                            //eg: Person instead of Customer

            wipEntityKey = datacontext.zStorageWip.storeWipEntity(vm.customer, vm.customer.customerID, wipEntityKey, entityName, description);
        }

        function autoStoreWip(immediate) {
            common.debouncedThrottle(controllerId, storeWipEntity, 1000, immediate);
        }

        function onEveryChange() {
            $scope.$on(config.events.entitiesChanged, function(event, data) {
                autoStoreWip();
            });
        }
    }
})();
