(function () {
    'use strict';

    var bootstrapModule = angular.module('common.bootstrap', ['ui.bootstrap']);

    bootstrapModule.factory('bootstrap.dialog', ['$modal', '$templateCache', modalDialog]);

    function modalDialog($modal, $templateCache) {
        var service = {
            inputDialog: inputDialog,
            deleteDialog: deleteDialog,
            confirmationDialog: confirmationDialog
        };

        $templateCache.put('modalDialog.tpl.html', 
            '<div>' +
            '    <div class="modal-header">' +
            '        <button type="button" class="close" data-dismiss="modal" aria-hidden="true" data-ng-click="cancel()">&times;</button>' +
            '        <h3>{{title}}</h3>' +
            '    </div>' +
            '    <div class="modal-body">' +
            '        <p>{{message}}</p>' +
            '    </div>' +
            '    <div class="modal-footer">' +
            '        <button class="btn btn-primary" data-ng-click="ok()">{{okText}}</button>' +
            '        <button class="btn btn-info" data-ng-click="cancel()">{{cancelText}}</button>' +
            '    </div>' +
            '</div>');

        $templateCache.put('modalInputDialog.tpl.html',
            '<div>' +
            '    <div class="modal-header">' +
            '        <button type="button" class="close" data-dismiss="modal" aria-hidden="true" data-ng-click="cancel()">&times;</button>' +
            '        <h3>{{title}}</h3>' +
            '    </div>' +
            '    <div class="modal-body">' +
            '        <label>{{label}}</label>' +
            '        <input data-ng-model="input.text" placeholder="Enter Text"/>' +
            '    </div>' +
            '    <div class="modal-footer">' +
            '        <button class="btn btn-primary" data-ng-click="ok()">{{okText}}</button>' +
            '        <button class="btn btn-info" data-ng-click="cancel()">{{cancelText}}</button>' +
            '    </div>' +
            '</div>');

        return service;

        function inputDialog(label) {
            var title = 'Enter Text';
            label = label || 'Enter Text';

            return inputDialog(title, label);
        }

        function deleteDialog(itemName) {
            var title = 'Confirm Delete';
            itemName = itemName || 'item';
            var msg = 'Delete ' + itemName + '?';

            return confirmationDialog(title, msg);
        }

        function confirmationDialog(title, msg, okText, cancelText) {

            var modalOptions = {
                templateUrl: 'modalDialog.tpl.html',
                controller: ModalInstance,
                keyboard: true,
                resolve: {
                    options: function () {
                        return {
                            title: title,
                            message: msg,
                            okText: okText,
                            cancelText: cancelText
                        };
                    }
                }
            };

            return $modal.open(modalOptions).result; 
        }

        function inputDialog(title, lbl, okText, cancelText) {

            var modalOptions = {
                templateUrl: 'modalInputDialog.tpl.html',
                controller: ModalInputInstance,
                keyboard: true,
                resolve: {
                    options: function () {
                        return {
                            title: title,
                            label: lbl,
                            okText: okText,
                            cancelText: cancelText
                        };
                    }
                }
            };

            return $modal.open(modalOptions).result;
        }
    }

    var ModalInstance = ['$scope', '$modalInstance', 'options',
        function ($scope, $modalInstance, options) {
            $scope.title = options.title || 'Title';
            $scope.message = options.message || '';
            $scope.okText = options.okText || 'OK';
            $scope.cancelText = options.cancelText || 'Cancel';
            $scope.ok = function () { $modalInstance.close('ok'); };
            $scope.cancel = function () { $modalInstance.dismiss('cancel'); };
        }];

    var ModalInputInstance = ['$scope', '$modalInstance', 'options',
        function ($scope, $modalInstance, options) {
            $scope.title = options.title || 'Title';
            $scope.label = options.label || '';
            $scope.input = {};
            $scope.okText = options.okText || 'OK';
            $scope.cancelText = options.cancelText || 'Cancel';
            $scope.ok = function() { $modalInstance.close($scope.input.text); };
            $scope.cancel = function () { $modalInstance.dismiss('cancel'); };
        }];
})();