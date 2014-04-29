jasmine.DEFAULT_TIMEOUT_INTERVAL = 60 * 1000;

describe("Excel related tests", function() {

    var customerItemListReader;
    var filename = 'http://localhost:3958/tests/CustomerItemList.xls';
    var $angularQ;

    beforeEach(module('app'));

    beforeEach(inject(function($injector, $q) {
        customerItemListReader = $injector.get('customerItemListReader');
        $angularQ = $q;
    }));

    it('should read CIL', function(done) {
        downloadExcelFile(filename)
            .then(function(data) {
                var results = customerItemListReader.getCustItemList(data, '136');
                done();
            }).fail(function(error) {
                console.log(error);
                done();
            });
    });

    function downloadExcelFile(excelFilename) {
        var ajaxRequest = {
            url: excelFilename,
            beforeSend: function (xhr) {
                xhr.overrideMimeType('text/plain; charset=x-user-defined');
            },
        };
        return $.ajax(ajaxRequest)
            .done(function (data) {
                return data;
            }).fail(function (jqXHR, textStatus, errorThrown) {
                return errorThrown;
            });
    }

    //function load_binary_resource(url) {
    //    var req = new XMLHttpRequest();
    //    req.open('GET', url, false);
    //    //XHR binary charset opt by Marcus Granado 2006 [http://mgran.blogspot.com]
    //    req.overrideMimeType('text\/plain; charset=x-user-defined');
    //    req.send(null);
    //    if (req.status != 200) return '';
    //    return req.responseText;
    //}

    

    //function readTextFile(file) {
    //    var defer = $angularQ.defer();
    //    var rawFile = new XMLHttpRequest();
    //    rawFile.open("GET", file, true);
    //    rawFile.onreadystatechange = function () {
    //        //defer.resolve(rawFile.responseText);
    //        if (rawFile.readyState === 4) {
    //            if (rawFile.status === 200 || rawFile.status == 0) {
    //                defer.resolve(rawFile.responseText);
    //            }
    //        }
    //    }
    //    rawFile.send(null);
    //    return defer.promise;
    //}

    //it('should read local file using jQuery $.ajax', function (jasmineDone) {
    //    var ajaxRequest = {
    //        url: filename,
    //        beforeSend: function (xhr) {
    //            xhr.overrideMimeType('text/plain; charset=UTF-8');
    //        },
    //    };
    //    $.ajax(ajaxRequest)
    //        .done(function (data) {
    //            expect(data).toBeTruthy();
    //            jasmineDone();
    //        }).fail(function (jqXHR, textStatus, errorThrown) {
    //            console.log(jqXHR.responseText);
    //            expect(true).toBe(false);
    //            jasmineDone();
    //        });
    //});

    //it('should read local file using raw XHR', function (jasmineDone) {
    //    readTextFile(filename);
    //    function readTextFile(file) {
    //        var rawFile = new XMLHttpRequest();
    //        rawFile.open("GET", file, true);
    //        rawFile.onreadystatechange = function () {
    //            if (rawFile.readyState === 4) {
    //                if (rawFile.status === 200 || rawFile.status == 0) {
    //                    var allText = rawFile.responseText;
    //                    alert(allText);
    //                }
    //            }
    //        }
    //        rawFile.send(null);
    //    }
    //});
    
});