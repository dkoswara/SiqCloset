(function () {
    'use strict';

    var app = angular.module('app');
    
    var keyCodes = {
        backspace: 8,
        tab: 9,
        enter: 13,
        esc: 27,
        space: 32,
        pageup: 33,
        pagedown: 34,
        end: 35,
        home: 36,
        left: 37,
        right: 39,
        down: 40,
        insert: 45,
        del: 46,
    };

    // Configure Toastr
    toastr.options.timeOut = 4000;
    toastr.options.positionClass = 'toast-bottom-right';

    // For use with the HotTowel-Angular-Breeze add-on that uses Breeze
    var siqClosetRemoteServiceName = 'breeze/Breeze';

    // For use to query currency exchange rate
    var rateExchangeRemoteServiceName = 'http://rate-exchange.appspot.com/';

    var events = {
        controllerActivateSuccess: 'controller.activateSuccess',
        spinnerToggle: 'spinner.toggle',
        hasChangesChanged: 'datacontext.hasChangesChanged',
        storage: {
            error: 'store.error',
            storeChanged: 'store.changed',
            wipChanged: 'wip.changed'
        },
        entitiesChanged: 'datacontext.entitiesChanged',
    };

    var config = {
        appErrorPrefix: '[SiqCloset Error] ', //Configure the exceptionHandler decorator
        docTitle: 'SiqCloset: ',
        events: events,
        siqClosetRemoteServiceName: siqClosetRemoteServiceName,
        rateExchangeRemoteServiceName: rateExchangeRemoteServiceName,
        keyCodes: keyCodes,
        version: '2.0.0'
    };

    app.value('config', config);
    
    app.config(['$logProvider', function ($logProvider) {
        // turn debugging off/on (no info or warn)
        if ($logProvider.debugEnabled) {
            $logProvider.debugEnabled(true);
        }
    }]);
    
    //#region Configure the common services via commonConfig
    app.config(['commonConfigProvider', function (cfg) {
        cfg.config.controllerActivateSuccessEvent = config.events.controllerActivateSuccess;
        cfg.config.spinnerToggleEvent = config.events.spinnerToggle;
    }]);
    //#endregion

    //#region Configure the Breeze Validation Directive
    //app.config(['zDirectivesConfigProvider', function (cfg) {
    //    cfg.zValidateTemplate = '<span class="invalid"><i class="icon-warning-sign"></i>' + 'No way!! %error%</span>';
    //}]);
    //#endregion

    //#region Configure the zStorage
    app.config(['zStorageConfigProvider', function (cfg) {
        cfg.config = {
            // These are the properties we need to set storage
            enabled: false,
            key: 'SiqCloset',
            events: events.storage,
            wipKey: 'SiqCloset.wip',
            appErrorPrefix: config.appErrorPrefix,
            version: config.version,
        };
    }]);
    //#endregion
})();