(function () {
    'use strict';

    var serviceId = 'customerItemListReader';

    angular.module('app').factory(serviceId, [customerItemListReader]);

    function customerItemListReader() {
        var service = {
            getCustItemList: getCustItemList,
        };

        return service;

        function getCustItemList(data, batchNo) {
            var workbook = convertRawDataToWorkbook(data);
            return convertSheetToJson(workbook, batchNo);
        }

        function convertRawDataToWorkbook(data) {
            var cfb = XLS.CFB.read(data, { type: "binary" });
            var v = XLS.parse_xlscfb(cfb);
            return v;
        }

        function convertSheetToJson(workbook, batchNumber) {
            var sheetName = 'BATCH ' + batchNumber;
            var sheet = workbook.Sheets[sheetName];
            var json = XLS.utils.sheet_to_row_object_array(sheet);
            return json;
        }
    }

})();