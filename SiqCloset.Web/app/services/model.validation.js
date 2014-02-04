(function () {
    'use strict';

    var serviceId = 'model.validation';
    
    angular.module('app').factory(serviceId, ['common', modelValidation]);

    function modelValidation(common) {
        var entityName;
        var Validator = breeze.Validator;

        var someStupidCustomValidator;
        var lettersOnlyRegexValidator;

        var service = {
            createAndRegister: createAndRegister
        };

        return service;

        function createAndRegister(eName, manager) {
            entityName = eName;
            //create validator
            someStupidCustomValidator = createSomeStupidCustomValidator();
            lettersOnlyRegexValidator = createLettersOnlyRegexValidator();
            //register it to breeze
            Validator.register(someStupidCustomValidator);
            Validator.register(lettersOnlyRegexValidator);
            //apply it to the entity
            manager.metadataStore.getEntityType(entityName).validators.push(someStupidCustomValidator);
            manager.metadataStore.getEntityType(entityName).getProperty('name').validators.push(lettersOnlyRegexValidator);
        }

        function createSomeStupidCustomValidator() {
            var name = 'someStupidCustomValidator';
            var ctx = {
                messageTemplate: '%displayName% has a stupid name',
                isRequired: true,
            };
            return new Validator(name, validateFn, ctx);

            function validateFn(customer) {
                return customer ? customer.name !== 'stupid' : false;
            }
        }

        function createLettersOnlyRegexValidator() {
            return breeze.Validator.makeRegExpValidator(
                "nameVal",
                /^[A-Za-z\s]+$/,
                "The %displayName% can only contain letters");
        }
    }
})();