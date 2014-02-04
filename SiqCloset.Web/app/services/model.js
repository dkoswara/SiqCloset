(function () {
    'use strict';

    var serviceId = 'model';

    angular.module('app').factory(serviceId, model);

    function model() {
        // Define the functions and properties to reveal.

        var modelInfo = {
            Customer: {
                entityName: 'Customer',
                resourceName: 'Customers',
            },
            Item: {
                entityName: 'Item',
                resourceName: 'Items',
            },
            Box: {
                entityName: 'Box',
                resourceName: 'Boxes',
            },
            Batch: {
                entityName: 'Batch',
                resourceName: 'Batches',
            }
        };
        
        var service = {
            modelInfo: modelInfo,
            createNullos: createNullos,
        };

        return service;
        
        function Customer() {
            this.isPartial = false;
            //this.id = null;
        }

        function createNullos(manager) {
            var unchanged = breeze.EntityState.Unchanged;
            return createNullo(modelInfo.Customer.entityName);

            function createNullo(entityName, values) {
                var initialValues = values || { name: '[Select a ' + entityName.toLowerCase() + ']' };
                return manager.createEntity(entityName, initialValues, unchanged);
            }
        }
    }
})();