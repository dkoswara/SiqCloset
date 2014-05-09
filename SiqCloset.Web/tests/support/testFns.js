var testFns = (function () {
    'use strict';

    var fns = {
        mockHttpReq: mockHttpReq,
    };

    return fns;

    function mockHttpReq() {
        
        inject(function ($httpBackend) {
            //mock any breeze request
            $httpBackend.whenGET(/^breeze\/Breeze/).respond(200);
            //mock any html request
            $httpBackend.whenGET(/^app.*?\.html$/).respond(200);
        });
    }
})();