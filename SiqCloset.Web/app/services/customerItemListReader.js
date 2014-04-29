(function () {
    'use strict';

    var serviceId = 'customerItemListReader';

    angular.module('app').factory(serviceId, [customerItemListReader]);

    function customerItemListReader() {
        var underscore = _;

        var service = {
            getCustItemList: getCustItemList,
        };

        return service;

        function getCustItemList(data, batchNo) {
            var workbook = convertRawDataToWorkbook(data);
            return convertSheetToObject(workbook, batchNo);
        }

        function convertRawDataToWorkbook(data) {
            var cfb = XLS.CFB.read(data, { type: 'binary' });
            var v = XLS.parse_xlscfb(cfb);
            return v;
        }

        function convertSheetToObject(workbook, batchNumber) {
            var sheetName = 'BATCH ' + batchNumber;
            var sheet = workbook.Sheets[sheetName];
            return createCustItemListObject(sheet);
        }

        function getFirstAndLastRowIndex(sheet) {
            //get the keys
            var keys = Object.keys(sheet);

            //get the B's and max number
            //the B column is where the Customer name is
            //and they're usually always populated
            var allTheBs = underscore.filter(keys, function(x) {
                return x.substr(0, 1) == 'B';
            });

            var min = underscore.min(allTheBs, function (x) {
                var num = x.substr(1);
                return parseInt(num);
            });

            var max = underscore.max(allTheBs, function (x) {
                var num = x.substr(1);
                return parseInt(num);
            });

            return {
                firstRowIndex: parseInt(min.substr(1)),
                lastRowIndex: parseInt(max.substr(1)),
            };
        }

        function createCustItemListObject(sheet) {
            var x = getFirstAndLastRowIndex(sheet);
            var custItemList = [];
            for (var i = x.firstRowIndex; i <= x.lastRowIndex; i++) {
                var custName = getCellValue(sheet, 'B', i);
                if (!custName) continue;
                var notes = getCellValue(sheet, 'A', i);
                var itemCode = getCellValue(sheet, 'C', i);
                var itemName = getCellValue(sheet, 'D', i);
                var boxNo = getCellValue(sheet, 'E', i, 0);
                var itemPrice = getCellValue(sheet, 'F', i, 0);

                var cil = {
                    Notes: notes,
                    CustomerName: custName,
                    ItemCode: itemCode,
                    ItemName: itemName,
                    BoxNo: boxNo,
                    Price: itemPrice,
                }
                custItemList.push(cil);
            }

            return custItemList;

            function getCellValue(s, letter, row, defaultValue) {
                defaultValue = defaultValue || '';
                var cellPos = letter + '' + row;
                return s[cellPos] ? JSON.parse(s[cellPos].v) : defaultValue;
            }
        }
    }

})();